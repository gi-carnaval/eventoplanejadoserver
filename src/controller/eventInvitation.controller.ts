import { createErrorResponse } from "@common/error.resource";
import { HttpStatus } from "@common/httpStatus";
import { eventInvitationServices } from "@services/eventInvitations.services";
import { FastifyReply, FastifyRequest } from "fastify";
import { eventController } from "./event.controller";
import { userController } from "./user.controller";
import { eventServices } from "@services/event.services";
import { webSocketController } from "./webSocket.controller";

async function getInvitations(request: FastifyRequest<{ Params: { eventId: string } }>, reply: FastifyReply) {
  const { eventId } = request.params

  const eventInvitations = await eventInvitationServices.getInvitationByEventId(eventId)

  if (eventInvitations.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventInvitations?.error}`))
  }

  return reply.status(HttpStatus.OK).send(eventInvitations.value)
}

async function saveInvitation(request: FastifyRequest<{ Params: { eventId: string }, Body: { guestId: string } }>, reply: FastifyReply) {
  const { eventId } = request.params
  const { guestId } = request.body

  const eventExists = await eventController.checkIfEventExists(reply, eventId)
  await userController.checkIfUserExists(reply, guestId)
  eventController.checkIfUserAlreadyIsInEvent(reply, eventId, guestId)
  const invitationAlreadyExists = await checkIfInvitationIsValid(eventId, guestId)
  if (!invitationAlreadyExists.isError()) {
    return reply.status(HttpStatus.CONFLICT).send(createErrorResponse("Convite já enviado"))
  }

  const invitation = await eventInvitationServices.createInvitation(eventId, guestId)

  if (invitation.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${invitation?.error}`))
  }

  const organizersId = eventExists?.EventUser.filter((user) => user.role === "ORGANIZER")


  organizersId?.forEach((organizer) => {
    const id = organizer.userId
    webSocketController.sendNotification(id, { type: "refreshNotification", userId: id })
  })

  webSocketController.sendEventUpdate(eventId, { type: 'refreshInvitationStatus', eventId })

  return reply.status(HttpStatus.OK).send("Solicitação enviada")
}

async function acceptInvitation(request: FastifyRequest<{ Params: { eventId: string, invitationId: string }, Body: { organizerId: string } }>, reply: FastifyReply) {
  const { eventId, invitationId } = request.params
  const { organizerId } = request.body

  await userController.checkIfUserExists(reply, organizerId)
  const isUserAOrganizer = await checkIfUserIsOrganizer(reply, invitationId, organizerId)
  const eventExists = await eventController.checkIfEventExists(reply, eventId)

  if (!isUserAOrganizer) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Usuário sem permissão"))
  }

  const invitation = await eventInvitationServices.updateInvitation(invitationId, "APPROVED")

  if (invitation.isError() || !invitation.value) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${invitation?.error}`))
  }

  const event = await eventServices.addUserToEvent(eventId, invitation.value.userId)

  if (event.isError() || !event.value) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${event?.error}`))
  }

  const organizersId = eventExists?.EventUser.filter((user) => user.role === "ORGANIZER")

  organizersId?.forEach((organizer) => {
    const id = organizer.userId
    webSocketController.sendNotification(id, { type: "refreshNotification", userId: id })
  })

  webSocketController.sendEventUpdate(eventId, { type: 'refreshInvitationStatus', eventId })

  return reply.status(HttpStatus.OK).send("Convidado aceito")
}

async function recuseInvitation(request: FastifyRequest<{ Params: { eventId: string, invitationId: string }, Body: { organizerId: string } }>, reply: FastifyReply) {
  const { invitationId, eventId } = request.params
  const { organizerId } = request.body

  await userController.checkIfUserExists(reply, organizerId)
  const isUserAOrganizer = await checkIfUserIsOrganizer(reply, invitationId, organizerId)

  if (!isUserAOrganizer) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Usuário sem permissão"))
  }

  const invitation = await eventInvitationServices.updateInvitation(invitationId, "REJECTED")

  if (invitation.isError() || !invitation.value) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${invitation?.error}`))
  }

  const organizersId = isUserAOrganizer?.event.EventUser.map((organizer) => { return organizer.userId })

  organizersId?.forEach((organizerId) => {
    webSocketController.sendNotification(organizerId, { type: "refreshNotification", userId: organizerId })
  })

  webSocketController.sendEventUpdate(eventId, { type: 'refreshInvitationStatus', eventId })

  return reply.status(HttpStatus.OK).send("Convidado Recusado")
}

async function getCountOrganizerInvitations(request: FastifyRequest<{ Params: { organizerId: string } }>, reply: FastifyReply) {
  const { organizerId } = request.params

  await userController.checkIfUserExists(reply, organizerId)
  const eventsInvitations = await eventInvitationServices.getCountInvitationsByOrganizer(organizerId)

  if (eventsInvitations.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventsInvitations?.error}`))
  }

  return reply.status(HttpStatus.OK).send(eventsInvitations.value)
}

async function getOrganizerInvitations(request: FastifyRequest<{ Params: { organizerId: string } }>, reply: FastifyReply) {
  const { organizerId } = request.params

  await userController.checkIfUserExists(reply, organizerId)
  const eventsInvitations = await eventInvitationServices.getInvitationsByOrganizer(organizerId)

  if (eventsInvitations.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventsInvitations?.error}`))
  }

  return reply.status(HttpStatus.OK).send(eventsInvitations.value)
}

async function checkIfUserIsOrganizer(reply: FastifyReply, invitationId: string, organizerId: string) {
  const isUserAOrganizer = await eventInvitationServices.getInvitationIfUserOrganizer(invitationId, organizerId)
  if (isUserAOrganizer.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${isUserAOrganizer?.error}`))
  }

  return isUserAOrganizer.value
}

async function checkIfInvitationIsValid(eventId: string, guestId: string) {
  const invitationsAlreadyExists = await eventInvitationServices.getIfGuestWasApproved(eventId, guestId)
  return invitationsAlreadyExists
}

export const eventInvitationController = {
  getInvitations,
  saveInvitation,
  acceptInvitation,
  recuseInvitation,
  getCountOrganizerInvitations,
  getOrganizerInvitations
}
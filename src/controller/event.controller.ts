import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GetEventRequest, GetEventsRequest, PostEventRequest } from "../resource/event.resource";
import { userServices } from "../services/user.services";
import { HttpStatus } from "../common/httpStatus";
import { createErrorResponse } from "../common/error.resource";
import { eventServices } from "../services/event.services";
import { eventSchema, validadeGuestInviteSchema } from "../schemas/eventSchemas";

async function getUserEvents(request: FastifyRequest<GetEventsRequest>, reply: FastifyReply) {
  const { userId } = request.params

  const userExists = await userServices.getUserByUserId(userId)

  if (userExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${userExists?.error}`))
  }

  const events = await eventServices.getEventsByOrganizer(userId)

  if (events.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${events.error}`))
  }

  if (!events.value) {
    return reply.status(HttpStatus.OK).send(events.value)
  }

  const organizedEventsWithStatus = eventServices.eventsWithStatus(events.value.organizedEvents)
  const invitedEventsWithStatus = eventServices.eventsWithStatus(events.value.invitedEvents)

  const response = { organizedEvents: organizedEventsWithStatus, invitedEvents: invitedEventsWithStatus, metrics: events.value.metrics }

  return reply.status(HttpStatus.OK).send(response)
}

async function getOrganizedEvent(request: FastifyRequest<GetEventRequest>, reply: FastifyReply) {
  const { eventId, userId } = request.params

  const eventExistsAndUserIsOwner = await eventServices.getOrganizedEvent(eventId, userId)

  if (eventExistsAndUserIsOwner.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventExistsAndUserIsOwner?.error}`))
  }

  if (!eventExistsAndUserIsOwner.value) {
    return reply.status(HttpStatus.OK).send(eventExistsAndUserIsOwner.value)
  }

  const eventWithStatus = eventServices.singleEventWithStatus(eventExistsAndUserIsOwner.value)

  return reply.status(HttpStatus.OK).send(eventWithStatus)
}

async function getInvitedEvent(request: FastifyRequest<GetEventRequest>, reply: FastifyReply) {
  const { eventId, userId } = request.params

  const eventExistsAndUserIsParticipant = await eventServices.getInvitedEvent(eventId, userId)

  if (eventExistsAndUserIsParticipant.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventExistsAndUserIsParticipant?.error}`))
  }

  if (!eventExistsAndUserIsParticipant.value) {
    return reply.status(HttpStatus.OK).send(eventExistsAndUserIsParticipant.value)
  }

  const eventWithStatus = eventServices.singleEventWithStatus(eventExistsAndUserIsParticipant.value)

  return reply.status(HttpStatus.OK).send(eventWithStatus)
}

async function checkIfEventExists(reply: FastifyReply, eventId: string) {
  const eventExists = await eventServices.getEvent(eventId)

  if (eventExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventExists?.error}`))
  }

  return eventExists.value
}

async function checkIfUserAlreadyIsInEvent(reply: FastifyReply, eventId: string, guestId: string) {
  const eventExists = await eventServices.getEvent(eventId)
  const userAlredyIsInEvent = eventExists.value?.EventUser.filter((user) => guestId === user.userId)

  if (userAlredyIsInEvent?.length != 0) {
    return reply.status(HttpStatus.CONFLICT).send(createErrorResponse("Usuário já está na lista"))
  }
}

async function saveEvent(request: FastifyRequest<PostEventRequest>, reply: FastifyReply) {
  try {
    const { eventData, userId } = eventSchema.parse(request.body)

    const userExists = await userServices.getUserByUserId(userId)

    if (userExists.isError()) {
      return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${userExists?.error}`))
    }

    await eventServices.saveEvent(eventData, userId)

  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400).send({ error: error.errors });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}

async function getInvitedEventRequest(request: FastifyRequest<{ Params: { eventId: string } }>, reply: FastifyReply) {
  const { eventId } = request.params

  const eventExists = await eventServices.getEvent(eventId)

  if (eventExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${eventExists?.error}`))
  }

  const event = await eventServices.getEventInvitedEventRequest(eventId)

  if (event.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${event?.error}`))
  }

  return reply.status(HttpStatus.OK).send(event.value)
}

async function validateGuestEntry(request: FastifyRequest<{ Params: { eventId: string }, Body: { eventUserId: string, organizerId: string } }>, reply: FastifyReply) {
  try {
    const { eventId } = request.params
    const { eventUserId, organizerId } = validadeGuestInviteSchema.parse(request.body)

    const isUserInThisEvent = await eventServices.getEventUserByIds(eventId, eventUserId)
    const isOrganizerOfThisEvent = await eventServices.getEventByOrganizerAndEventId(eventId, organizerId)

    if (isUserInThisEvent.isError() && !isUserInThisEvent.value) {
      return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${isUserInThisEvent?.error}`))
    }

    const eventUserStatus =  isUserInThisEvent.value && await eventServices.getEventUserStatus(isUserInThisEvent.value)

    if(eventUserStatus === "CHECKED_IN") {
      return reply.status(HttpStatus.CONFLICT).send(createErrorResponse("Usuário já validado"))
    }

    if (isOrganizerOfThisEvent.isError()) {
      return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse(`${isOrganizerOfThisEvent?.error}`))
    }

    const eventUserUpdatedStatus = await eventServices.updateEventUser(eventUserId)

    if (eventUserUpdatedStatus.isError()) {
      return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createErrorResponse(`${eventUserUpdatedStatus?.error}`))
    }

    return reply.status(HttpStatus.OK).send("Usuário validado com sucesso")

  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400).send({ error: error.errors });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}

export const eventController = {
  getUserEvents,
  saveEvent,
  getOrganizedEvent,
  getInvitedEvent,
  checkIfEventExists,
  checkIfUserAlreadyIsInEvent,
  getInvitedEventRequest,
  validateGuestEntry
}
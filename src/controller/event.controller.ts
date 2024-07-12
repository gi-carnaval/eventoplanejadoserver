import { FastifyReply, FastifyRequest } from "fastify";
import { userServices } from "@services/user.services";
import { HttpStatus } from "@common/httpStatus";
import { createErrorResponse } from "@common/error.resource";
import { eventServices } from "@services/event.services";
import { GetEventRequest, GetEventsRequest, PostEventRequest } from "@resource/event.resource";
import { eventSchema } from "schemas/eventSchemas";
import { z } from "zod";

async function getOrganizedEvents(request: FastifyRequest<GetEventsRequest>, reply: FastifyReply) {
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

  const eventsWithStatus = eventServices.eventsWithStatus(events.value)

  return reply.status(HttpStatus.OK).send(eventsWithStatus)
}

async function getAllEventsByUser(request: FastifyRequest<GetEventsRequest>, reply: FastifyReply) {
  const { userId } = request.params

  const userExists = await userServices.getUserByUserId(userId)

  if (userExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${userExists?.error}`))
  }

  const events = await eventServices.getAllEventsByUser(userId)

  if (events.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${events.error}`))
  }

  if (!events.value) {
    return reply.status(HttpStatus.OK).send(events.value)
  }

  const eventsWithStatus = eventServices.eventsWithStatus(events.value)

  return reply.status(HttpStatus.OK).send(eventsWithStatus)
}

async function getEventsMetrics(request: FastifyRequest<GetEventsRequest>, reply: FastifyReply) {
  const { userId } = request.params

  const userExists = await userServices.getUserByUserId(userId)

  if (userExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${userExists?.error}`))
  }

  const events = await eventServices.getMetrics(userId)

  if (events.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${events.error}`))
  }

  return reply.status(HttpStatus.OK).send(events.value)
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

async function checkIfEventExists(reply: FastifyReply, eventId: string){
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

export const eventController = {
  getOrganizedEvents,
  getAllEventsByUser,
  saveEvent,
  getEventsMetrics,
  getOrganizedEvent,
  getInvitedEvent,
  checkIfEventExists,
  checkIfUserAlreadyIsInEvent
}

import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated";
import { eventController } from "../controller/event.controller";

async function eventRoutes(fastify: FastifyInstance) {
  fastify.get('/organized-event/:userId/:eventId', { preHandler: ensureAuthenticated }, eventController.getOrganizedEvent)
  fastify.get('/invited-event/:userId/:eventId', { preHandler: ensureAuthenticated }, eventController.getInvitedEvent)
  fastify.get('/events/:userId', { preHandler: ensureAuthenticated }, eventController.getUserEvents)
  fastify.get('/invited-event-request/:eventId', eventController.getInvitedEventRequest)
  fastify.post('/event', { preHandler: ensureAuthenticated }, eventController.saveEvent)
  fastify.put('/event/:eventId', eventController.validateGuestEntry)
}

export { eventRoutes }
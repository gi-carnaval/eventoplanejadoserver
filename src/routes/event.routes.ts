import { eventController } from "@controller/event.controller";
import { ensureAuthenticated } from "@middleware/ensureAuthenticated";
import { FastifyInstance } from "fastify";

async function eventRoutes(fastify: FastifyInstance) {
  fastify.get('/events/:userId', { preHandler: ensureAuthenticated }, eventController.getAllEventsByUser)
  fastify.get('/organized-event/:userId/:eventId', /*{ preHandler: ensureAuthenticated },*/ eventController.getOrganizedEvent)
  fastify.get('/invited-event/:userId/:eventId', { preHandler: ensureAuthenticated }, eventController.getInvitedEvent)
  fastify.get('/organized-events/:userId', { preHandler: ensureAuthenticated }, eventController.getOrganizedEvents)
  fastify.get('/events/metrics/:userId', { preHandler: ensureAuthenticated }, eventController.getEventsMetrics)
  fastify.post('/event', { preHandler: ensureAuthenticated }, eventController.saveEvent)
}

export { eventRoutes }
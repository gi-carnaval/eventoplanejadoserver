
import { FastifyInstance } from "fastify";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated";
import { eventInvitationController } from "../controller/eventInvitation.controller";

async function eventInvitationRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/event/:eventId/request-entry",
    preHandler: ensureAuthenticated,
    handler: eventInvitationController.getInvitations,
  })
  fastify.route({
    method: "GET",
    url: "/eventInvitations/:organizerId/count",
    preHandler: ensureAuthenticated,
    handler: eventInvitationController.getCountOrganizerInvitations,
  })
  fastify.route({
    method: "GET",
    url: "/eventInvitations/:organizerId",
    // preHandler: ensureAuthenticated,
    handler: eventInvitationController.getOrganizerInvitations,
  })
  fastify.route({
    method: "post",
    url: "/event/:eventId/request-entry",
    preHandler: ensureAuthenticated,
    handler: eventInvitationController.saveInvitation,
  })
  fastify.route({
    method: "put",
    url: "/event/:eventId/invitations/:invitationId/accept",
    preHandler: ensureAuthenticated,
    handler: eventInvitationController.acceptInvitation,
  })
  fastify.route({
    method: "put",
    url: "/event/:eventId/invitations/:invitationId/recuse",
    preHandler: ensureAuthenticated,
    handler: eventInvitationController.recuseInvitation,
  })
}

export { eventInvitationRoutes }
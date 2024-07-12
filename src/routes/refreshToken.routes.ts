import { refreshTokenController } from "@controller/refreshTokenUser.controller";
import { FastifyInstance } from "fastify";

async function refreshTokenRoutes(fastify: FastifyInstance) {
  fastify.post('/refresh-token', refreshTokenController.refreshToken)
}

export { refreshTokenRoutes }
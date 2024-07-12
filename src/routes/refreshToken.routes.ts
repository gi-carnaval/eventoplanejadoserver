import { FastifyInstance } from "fastify";
import { refreshTokenController } from "../controller/refreshTokenUser.controller";

async function refreshTokenRoutes(fastify: FastifyInstance) {
  fastify.post('/refresh-token', refreshTokenController.refreshToken)
}

export { refreshTokenRoutes }
import { authController } from "@controller/auth.controller";
import { FastifyInstance } from "fastify";

async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth', authController.authenticateUser)
}

export {authRoutes}
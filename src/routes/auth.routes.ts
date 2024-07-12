import { FastifyInstance } from "fastify";
import { authController } from "../controller/auth.controller";

async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth', authController.authenticateUser)
}

export { authRoutes }
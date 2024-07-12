import { userController } from "@controller/user.controller";
import { FastifyInstance } from "fastify";

async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/user/:userId', userController.getUser)
}

export { userRoutes }
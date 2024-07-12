import { FastifyInstance } from "fastify";
import { userController } from "../controller/user.controller";

async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/user/:userId', userController.getUser)
}

export { userRoutes }
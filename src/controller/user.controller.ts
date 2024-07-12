import { createErrorResponse } from "@common/error.resource";
import { HttpStatus } from "@common/httpStatus";
import { userServices } from "@services/user.services";
import { FastifyReply, FastifyRequest } from "fastify";


async function getUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
  const { userId } = request.params

  const user = await userServices.getUserByUserId(userId)

  if (user.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${user?.error}`))
  }

  return reply.status(HttpStatus.OK).send(user.value)

}

async function checkIfUserExists(reply: FastifyReply, userId: string) {
  const userExists = await userServices.getUserByUserId(userId)

  if (userExists.isError()) {
    return reply.status(HttpStatus.NOT_FOUND).send(createErrorResponse(`${userExists?.error}`))
  }
}

export const userController = {
  getUser,
  checkIfUserExists
}
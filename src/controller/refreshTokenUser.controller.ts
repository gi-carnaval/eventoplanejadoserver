import { createErrorResponse } from "@common/error.resource";
import { HttpStatus } from "@common/httpStatus";
import { refreshTokenUserServices } from "@services/refreshtokenUser.services";
import { FastifyReply, FastifyRequest } from "fastify";


async function refreshToken(request: FastifyRequest<{ Body: { refresh_token: string } }>, reply: FastifyReply) {
  const { refresh_token } = request.body

  const token = await refreshTokenUserServices.refreshTokenUser(refresh_token)

  if(token.isError()) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse(`${token.error}`))
  }

  return reply.status(HttpStatus.OK).send(token.value)
}

export const refreshTokenController = {
  refreshToken
}
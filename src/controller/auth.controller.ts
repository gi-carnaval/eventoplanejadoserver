import { createErrorResponse } from "@common/error.resource";
import { HttpStatus } from "@common/httpStatus";
import { api } from "@lib/axios";
import { authServices } from "@services/auth.services";
import { userServices } from "@services/user.services";
import { FastifyReply, FastifyRequest } from "fastify";
import { authenticateUserBody } from "resource/auth.resource";


async function authenticateUser(request: FastifyRequest<{ Body: authenticateUserBody }>, reply: FastifyReply) {
  const { access_token } = request.body;
  if (!access_token) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Access Token is missing"))
  }
  try {
    const response = await api.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json'
      }
    })

    const user = await userServices.getUser(response.data)

    if (!user?.value) {
      return reply.status(HttpStatus.BAD_REQUEST).send(createErrorResponse(`${user?.error}`))
    }
    //Criação do Token pelo authServices
    const token = await authServices.createToken(user.value.id)

    if (token.isError()) {
      return reply.status(HttpStatus.BAD_REQUEST).send(createErrorResponse(`${token.error}`))
    }

    return reply.status(HttpStatus.OK).send(token.value)

  } catch (error) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Access Token invalid"))
  }

}

export const authController = {
  authenticateUser
}
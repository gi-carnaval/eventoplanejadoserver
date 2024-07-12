
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { verify } from "jsonwebtoken";
import { HttpStatus } from "../common/httpStatus";
import { createErrorResponse } from "../common/error.resource";

export function ensureAuthenticated(request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) {
  const authToken = request.headers.authorization

  if (!authToken) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Token is missing"))
  }

  const [, token] = authToken.split(" ")
  try {
    verify(token, `${process.env.JTW_SECRET}`)
    return next()

  } catch (error) {
    return reply.status(HttpStatus.UNAUTHORIZED).send(createErrorResponse("Token invalid"))
  }

}
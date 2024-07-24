import Fastify, { FastifyReply } from "fastify";
import cors from '@fastify/cors'
import { userRoutes } from "./routes/user.routes";
import { eventRoutes } from "./routes/event.routes";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { eventInvitationRoutes } from "./routes/eventInvitation.routes";
import { fastifyWebsocket } from "@fastify/websocket"
import { wsRoutes } from "./routes/webSocket.routes";
import { authRoutes } from "./routes/auth.routes";
import { testRoutes } from "./routes/testRoutes";
import { refreshTokenRoutes } from "./routes/refreshToken.routes";

const fastify = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>()

fastify.register(fastifyWebsocket, {
  options: { maxPayload: 1048576, clientTracking: true },
})

fastify.get('/', async function handler (request, reply) {
  return { hello: 'world - teste' }
})

fastify.get('/testeDeDeploy', async function handler (request, reply) {
  return { Funcionou: 'Esta mensagem representa o deploy automático funcionando' }
})

fastify.register(wsRoutes)

fastify.register(async function (fastify) {
  fastify.get('/test', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    socket.on('message', message => {
      socket.send(message.toString())
      const data = JSON.parse(message.toString())
      if (data.type === 'joinEvent') {
        socket.send("Join")
      }
    })
  })
})

fastify.register(authRoutes, { prefix: '/api' })
fastify.register(testRoutes, { prefix: '/api' })
fastify.register(refreshTokenRoutes, { prefix: '/api' })
fastify.register(userRoutes, { prefix: '/api' })
fastify.register(eventRoutes, { prefix: '/api' })
fastify.register(eventInvitationRoutes, { prefix: '/api' })

fastify.register(cors, {
  origin: (origin, cb) => {
    cb(null, true)
  }
})

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`)
})
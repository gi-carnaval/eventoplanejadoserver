import { ensureAuthenticated } from "@middleware/ensureAuthenticated";
import { FastifyInstance, FastifyReply, FastifyRequest, RouteGenericInterface } from "fastify";

interface GetEventsRequest extends RouteGenericInterface {
  Params: {
    userId: string;
  };
}

const getName = (req: FastifyRequest<GetEventsRequest>, res: FastifyReply) => {
  return res.send([
    { id: 1, name: "Giovani" },
    { id: 2, name: "Vitoria" },
    { id: 3, name: "Isabela" },
    { id: 4, name: "Clelia" },
    { id: 5, name: "Ricardo" }
  ])
}

async function testRoutes(fastify: FastifyInstance) {
  fastify.get('/teste', { preHandler: ensureAuthenticated }, getName)
}

export { testRoutes }
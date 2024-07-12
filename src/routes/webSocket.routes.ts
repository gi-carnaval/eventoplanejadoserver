import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import { webSocketController } from "../controller/webSocket.controller";

export const eventConnections: Map<string, WebSocket[]> = new Map();
export const userConnections: Map<string, WebSocket[]> = new Map();

async function wsRoutes(fastify: FastifyInstance) {
  fastify.get('/ws/events', { websocket: true }, webSocketController.eventConnectionsManage)
  fastify.get('/ws/users', { websocket: true }, webSocketController.userConnectionsManage)
}

export { wsRoutes }
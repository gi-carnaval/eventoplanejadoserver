
import { WebSocket } from "@fastify/websocket";
import { eventConnections, userConnections } from "../routes/webSocket.routes";

function sendEventUpdate(eventId: string, data: any) {
  if (eventConnections.has(eventId)) {
    eventConnections.get(eventId)?.forEach(socket => {
      socket.send(JSON.stringify(data));
    });
  }
}
function sendNotification(userId: string, data: any) {
  if (userConnections.has(userId)) {
    userConnections.get(userId)?.forEach(socket => {
      socket.send(JSON.stringify(data));
    });
  }
}

function userConnectionsManage(conn: WebSocket) {
  conn.on('message', async (message: string) => {
    const data = JSON.parse(message.toString())

    if (data.type === 'refreshUserNotifications') {
      const userId = data.userId;
      if (!userConnections.has(userId)) {
        userConnections.set(userId, []);
      }
      userConnections.get(userId)?.push(conn);
    }
  })

  conn.on('close', () => {
    for (const [userId, sockets] of userConnections.entries()) {
      const index = sockets.indexOf(conn);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          userConnections.delete(userId);
        }
      }
    }
  })
}

function eventConnectionsManage(conn: WebSocket) {
  conn.on('message', async (message: string) => {
    const data = JSON.parse(message.toString())

    if (data.type === 'refreshSingleEvent') {
      const eventId = data.eventId;
      if (!eventConnections.has(eventId)) {
        eventConnections.set(eventId, []);
      }
      eventConnections.get(eventId)?.push(conn);
    }
  })

  conn.on('close', () => {
    for (const [eventId, sockets] of eventConnections.entries()) {
      const index = sockets.indexOf(conn);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          eventConnections.delete(eventId);
        }
      }
    }
  })
}

export const webSocketController = {
  eventConnectionsManage,
  sendEventUpdate,
  userConnectionsManage,
  sendNotification
}
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*', // Điều chỉnh lại cho phù hợp với prod
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map userId -> set of socketIds
  private userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      console.log(`Client connected: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
      console.log(`Client disconnected: ${client.id}`);
    }
  }

  // Gửi thông báo tới tất cả các socket của 1 user
  sendNotification(userId: number, notification: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }

  private getUserIdFromSocket(client: Socket): number | null {
    // Lấy userId từ handshake query hoặc auth token
    // Trong thực tế nên verify JWT ở đây
    const userId = client.handshake.query.userId || client.handshake.auth.userId;
    return userId ? parseInt(userId as string) : null;
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  // Map userId -> set of socketIds
  private userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      console.log(`Chat connected: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
      console.log(`Chat disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const room = `conversation_${data.conversationId}`;
    client.join(room);
    return { status: 'joined', room };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; content: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return { error: 'Unauthorized' };

    const message = await this.chatService.sendMessage(
      data.conversationId,
      userId,
      data.content,
    );

    const room = `conversation_${data.conversationId}`;
    this.server.to(room).emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const userId = this.getUserIdFromSocket(client);
    const room = `conversation_${data.conversationId}`;
    client.to(room).emit('userTyping', { userId, isTyping: data.isTyping });
  }

  private getUserIdFromSocket(client: Socket): number | null {
    const userId = client.handshake.query.userId || client.handshake.auth.userId;
    return userId ? parseInt(userId as string) : null;
  }
}

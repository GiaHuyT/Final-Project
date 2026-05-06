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
import { containsBannedWords } from '../../common/utils/content-filter.util';

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

    if (containsBannedWords(data.content)) {
      return { error: 'Nội dung chứa từ khóa vi phạm tiêu chuẩn cộng đồng.' };
    }

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

  @SubscribeMessage('join-stream')
  handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; isVendor: boolean },
  ) {
    const room = `stream_auction_${data.auctionId}`;
    client.join(room);
    console.log(`Socket ${client.id} joined stream ${room} as ${data.isVendor ? 'Vendor' : 'Viewer'}`);

    if (!data.isVendor) {
      // Notify the vendor that a new viewer joined so the vendor can send an offer
      client.to(room).emit('viewer-joined', { viewerId: client.id });
    }
  }

  @SubscribeMessage('webrtc-offer')
  handleWebRtcOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; offer: any; auctionId: string },
  ) {
    // Forward the offer directly to the specific viewer
    client.to(data.targetId).emit('webrtc-offer', {
      senderId: client.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleWebRtcAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; answer: any; auctionId: string },
  ) {
    // Forward the answer back to the vendor
    client.to(data.targetId).emit('webrtc-answer', {
      senderId: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; candidate: any; auctionId: string },
  ) {
    // Forward ICE candidate to the target
    client.to(data.targetId).emit('webrtc-ice-candidate', {
      senderId: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('stream-started')
  handleStreamStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    const room = `stream_auction_${data.auctionId}`;
    client.to(room).emit('stream-started');
  }

  private getUserIdFromSocket(client: Socket): number | null {
    const userId = client.handshake.query.userId || client.handshake.auth.userId;
    return userId ? parseInt(userId as string) : null;
  }
}

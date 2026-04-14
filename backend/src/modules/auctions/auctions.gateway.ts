import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly auctionsService: AuctionsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected to Auction Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from Auction Gateway: ${client.id}`);
  }

  @SubscribeMessage('joinAuction')
  handleJoinRoom(@MessageBody() data: { auctionId: number }, @ConnectedSocket() client: Socket) {
    const roomName = `auction_${data.auctionId}`;
    client.join(roomName);
    console.log(`Client ${client.id} joined room ${roomName}`);
  }

  @SubscribeMessage('leaveAuction')
  handleLeaveRoom(@MessageBody() data: { auctionId: number }, @ConnectedSocket() client: Socket) {
    const roomName = `auction_${data.auctionId}`;
    client.leave(roomName);
    console.log(`Client ${client.id} left room ${roomName}`);
  }

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @MessageBody() data: { auctionId: number; userId: number; bidAmount: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { bid, auction } = await this.auctionsService.placeBid(
        data.auctionId,
        data.userId,
        data.bidAmount,
      );

      // Broadcast new bid to all clients in the room
      this.server.to(`auction_${data.auctionId}`).emit('newBid', {
        bid,
        currentPrice: auction.currentPrice,
        endTime: auction.endTime, // Send potentially extended endTime
      });

      return { status: 'success', data: bid };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  }
}

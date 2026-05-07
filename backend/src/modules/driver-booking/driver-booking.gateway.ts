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
import { DriverBookingService } from './driver-booking.service';
import { PrismaService } from '../../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'rides',
})
export class DriverBookingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private bookingService: DriverBookingService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      console.log(`Ride connected: ${client.id} (User: ${userId})`);
      
      // Check if user is a driver, if so join 'drivers' room
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.roles.includes('DRIVER')) {
        client.join('drivers');
        console.log(`User ${userId} joined drivers room`);
      }
      
      // Join a personal room to receive personal notifications (like ride accepted)
      client.join(`user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Ride disconnected: ${client.id}`);
  }

  @SubscribeMessage('request-ride')
  async handleRequestRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return { error: 'Unauthorized' };

    try {
      // 1. Create booking in DB
      const booking = await this.bookingService.createBooking(userId, data);
      
      // 2. Broadcast to all drivers
      this.server.to('drivers').emit('new-ride-request', booking);
      
      return booking;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('accept-ride')
  async handleAcceptRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const driverId = this.getUserIdFromSocket(client);
    if (!driverId) return { error: 'Unauthorized' };

    try {
      // 1. Accept booking in DB
      const booking = await this.bookingService.acceptBooking(driverId, data.bookingId);
      
      // 2. Notify the customer that their ride was accepted
      this.server.to(`user_${booking.customerId}`).emit('ride-accepted', booking);
      
      // 3. Optional: Notify other drivers that the ride is taken (to remove from their UI)
      this.server.to('drivers').emit('ride-taken', { bookingId: data.bookingId });

      return booking;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('update-ride-status')
  async handleUpdateRideStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number, status: string },
  ) {
    const driverId = this.getUserIdFromSocket(client);
    if (!driverId) return { error: 'Unauthorized' };

    try {
      const booking = await this.bookingService.updateBookingStatus(driverId, data.bookingId, data.status);
      this.server.to(`user_${booking.customerId}`).emit('ride-status-updated', booking);
      return booking;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('confirm-ride')
  async handleConfirmRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const customerId = this.getUserIdFromSocket(client);
    if (!customerId) return { error: 'Unauthorized' };

    try {
      const booking = await this.bookingService.completeBooking(customerId, data.bookingId);
      // Notify the driver that the ride is completed
      this.server.to(`user_${booking.driverId}`).emit('ride-status-updated', booking);
      return booking;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('cancel-ride')
  async handleCancelRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return { error: 'Unauthorized' };

    try {
      const booking = await this.bookingService.cancelBooking(userId, data.bookingId);
      
      // Notify drivers to remove from their UI
      this.server.to('drivers').emit('ride-cancelled', { bookingId: data.bookingId });
      
      // Notify customer (in case driver cancelled)
      this.server.to(`user_${booking.customerId}`).emit('ride-cancelled', { bookingId: data.bookingId });
      
      // Notify the specific driver (in case customer cancelled and driver had already accepted)
      if (booking.driverId) {
         this.server.to(`user_${booking.driverId}`).emit('ride-cancelled', { bookingId: data.bookingId });
      }
      return booking;
    } catch (error) {
      return { error: error.message };
    }
  }

  private getUserIdFromSocket(client: Socket): number | null {
    const userId = client.handshake.query.userId || client.handshake.auth.userId;
    return userId ? parseInt(userId as string) : null;
  }

  // --- Exposed methods for Controller ---
  notifyRideAccepted(booking: any) {
    this.server.to(`user_${booking.customerId}`).emit('ride-accepted', booking);
    this.server.to('drivers').emit('ride-taken', { bookingId: booking.id });
  }

  notifyRideStatusUpdated(booking: any) {
    this.server.to(`user_${booking.customerId}`).emit('ride-status-updated', booking);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async createConversation(participantIds: number[], productId?: number) {
    // Check if conversation already exists for these participants (simplified for 2 people)
    if (participantIds.length === 2) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: participantIds[0] } } },
            { participants: { some: { id: participantIds[1] } } },
          ],
          productId: productId || null,
        },
        include: {
          participants: true,
          messages: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (existing) return existing;
    }

    return this.prisma.conversation.create({
      data: {
        productId,
        participants: {
          connect: participantIds.map((id) => ({ id })),
        },
      },
      include: {
        participants: true,
        messages: true,
      },
    });
  }

  async getConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(conversationId: number, skip = 0, take = 20) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Notify the other participant
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: { select: { id: true } } },
      });

      if (conversation) {
        const otherParticipant = conversation.participants.find((p) => p.id !== senderId);
        if (otherParticipant) {
          const preview = content.length > 50 ? `${content.substring(0, 50)}...` : content;
          await this.notifications.create(otherParticipant.id, {
            type: NotificationType.CHAT,
            content: `${message.sender.username} đã gửi cho bạn một tin nhắn: ${preview}`,
            link: '/messages', // Assuming this is the message center route
            metadata: { conversationId, senderId },
          });
        }
      }
    } catch (err) {
      console.error('Failed to send chat notification:', err);
    }

    return message;
  }

  async markAsRead(messageIds: number[]) {
    return this.prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { isRead: true },
    });
  }
}

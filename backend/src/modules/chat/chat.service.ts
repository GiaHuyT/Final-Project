import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

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

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(messageIds: number[]) {
    return this.prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { isRead: true },
    });
  }
}

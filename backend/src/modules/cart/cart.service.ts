import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService
  ) {}

  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                brand: true,
                modelName: true,
                stock: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    return cart;
  }

  async addItem(userId: number, productId: number, quantity: number) {
    const cart = await this.getCart(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });

    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (!product.status) throw new BadRequestException('Sản phẩm đã ngừng bán');
    if (quantity > product.stock) throw new BadRequestException(`Sản phẩm chỉ còn ${product.stock} chiếc trong kho`);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
         throw new BadRequestException(`Không đủ hàng. Hiện chỉ có ${product.stock} chiếc.`);
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
      return this.getCart(userId);
    }

    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      }
    });
    
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: number, itemId: number, quantity: number) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
        include: { product: true }
    });
    
    if (!item) throw new NotFoundException('Sản phẩm không nằm trong giỏ hàng');
    
    if (quantity <= 0) {
        return this.removeItem(userId, itemId);
    }
    
    if (quantity > item.product.stock) {
        throw new BadRequestException(`Chỉ có thể đặt tối đa ${item.product.stock} chiếc.`);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
    
    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id }
    });
    if (!item) throw new NotFoundException('Sản phẩm không nằm trong giỏ hàng');

    await this.prisma.cartItem.delete({
      where: { id: itemId }
    });
    
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    return this.getCart(userId);
  }

  async checkout(userId: number) {
    const cart = await this.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    let totalPrice = 0;
    const orderItemsData = cart.items.map(item => {
      const itemPrice = item.product.price * item.quantity;
      totalPrice += itemPrice;
      return {
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // Create Order
    const order = await this.prisma.order.create({
      data: {
        customerId: userId,
        totalPrice,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
    });

    // Clear cart
    await this.clearCart(userId);

    // Create Transaction for Payment (Cọc 0.001%)
    return this.transactionsService.createTransactionForOrder(
      order.id,
      Math.round(totalPrice * 0.00001),
      `Coc don hang ${order.id}`
    );
  }
}


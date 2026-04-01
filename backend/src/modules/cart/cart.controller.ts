import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Request } from 'express';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  addItem(@Req() req: any, @Body() body: { productId: number; quantity?: number }) {
    return this.cartService.addItem(req.user.id, body.productId, body.quantity || 1);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  updateItemQuantity(@Req() req: any, @Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItemQuantity(req.user.id, +id, body.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  removeItem(@Req() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}

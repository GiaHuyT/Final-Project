import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  console.log('Deleted all orders and order items');
}
main().finally(() => prisma.$disconnect());

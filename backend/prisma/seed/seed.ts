import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Đang xóa dữ liệu cũ...');
  // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại seed
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.auctionBid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.serviceProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Đang tạo dữ liệu mẫu...');

  // 1. Tạo Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashed_password_123', // Trong thực tế nên dùng bcrypt
      role: Role.ADMIN,

    },
  });

  const vendor = await prisma.user.create({
    data: {
      username: 'vendor1',
      email: 'vendor1@example.com',
      password: 'hashed_password_123',
      role: Role.VENDOR,

      isApprovedVendor: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      username: 'customer1',
      email: 'customer1@example.com',
      password: 'hashed_password_123',
      role: Role.CUSTOMER,

    },
  });

  // 2. Tạo Category
  const catElectronic = await prisma.category.create({
    data: { name: 'Điện tử' },
  });
  const catFurniture = await prisma.category.create({
    data: { name: 'Nội thất' },
  });

  // 3. Tạo Sản phẩm cho Vendor
  await prisma.product.createMany({
    data: [
      {
        name: 'iPhone 15 Pro',
        description: 'Máy mới 100%',
        price: 25000000,
        stock: 10,
        vendorId: vendor.id,
        categoryId: catElectronic.id,
      },
      {
        name: 'Bàn làm việc gỗ',
        description: 'Gỗ sồi tự nhiên',
        price: 1500000,
        stock: 5,
        vendorId: vendor.id,
        categoryId: catFurniture.id,
      },
    ],
  });

  console.log('Gieo hạt dữ liệu thành công! 🌱');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

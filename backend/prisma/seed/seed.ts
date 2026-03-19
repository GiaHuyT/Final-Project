import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  console.log('Đang xóa dữ liệu cũ...');
  // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại seed
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.carModel.deleteMany();
  await prisma.brand.deleteMany();
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
      password: hashedPassword, // '123456' encoded with bcrypt
      role: Role.ADMIN,

    },
  });

  const vendor = await prisma.user.create({
    data: {
      username: 'vendor1',
      email: 'vendor1@example.com',
      password: hashedPassword,
      role: Role.VENDOR,

      isApprovedVendor: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      username: 'customer1',
      email: 'customer1@example.com',
      password: hashedPassword,
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

  // 4. Tạo dữ liệu Hãng & Dòng xe
  const carData = [
    { brand: 'Toyota', models: ['Corolla', 'Camry', 'Vios', 'Fortuner', 'Hilux', 'Land Cruiser', 'Yaris'] },
    { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'City', 'Brio', 'Pilot'] },
    { brand: 'Hyundai', models: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Kona', 'Palisade'] },
    { brand: 'Kia', models: ['Morning', 'Cerato', 'K5', 'Seltos', 'Sportage', 'Sorento', 'Carnival'] },
    { brand: 'Mazda', models: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-8', 'CX-9'] },
    { brand: 'Ford', models: ['Ranger', 'Everest', 'Explorer', 'Escape', 'Focus', 'Mustang', 'F-150'] },
    { brand: 'Chevrolet', models: ['Spark', 'Cruze', 'Malibu', 'Trax', 'Equinox', 'Traverse', 'Colorado'] },
    { brand: 'Nissan', models: ['Sunny', 'Almera', 'Altima', 'X-Trail', 'Navara', 'Terra', 'Patrol'] },
    { brand: 'Mitsubishi', models: ['Mirage', 'Attrage', 'Xpander', 'Outlander', 'Pajero Sport', 'Triton', 'Eclipse Cross'] },
    { brand: 'Suzuki', models: ['Celerio', 'Swift', 'Ertiga', 'XL7', 'Jimny', 'Carry', 'Vitara'] },
    { brand: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', "X7"] },
    { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS'] },
    { brand: 'Audi', models: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7'] },
    { brand: 'Volkswagen', models: ['Polo', 'Golf', 'Passat', 'Jetta', 'Tiguan', 'Touareg', 'T-Cross'] },
    { brand: 'Lexus', models: ['IS', 'ES', 'LS', 'NX', 'RX', 'GX', 'LX'] },
    { brand: 'Subaru', models: ['Impreza', 'Legacy', 'Forester', 'Outback', 'XV (Crosstrek)', 'WRX', 'BRZ'] },
    { brand: 'Peugeot', models: ['208', '308', '408', '508', '2008', '3008', '5008'] },
    { brand: 'Volvo', "models": ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'V60', 'V90'] },
    { brand: 'VinFast', models: ['Fadil', 'Lux A2.0', 'Lux SA2.0', 'VF e34', 'VF 5', 'VF 6', 'VF 8'] },
    { brand: 'Tesla', models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'] }
  ];

  for (const item of carData) {
    const brand = await prisma.brand.create({
      data: { name: item.brand }
    });
    for (const model of item.models) {
      await prisma.carModel.create({
        data: { name: model, brandId: brand.id }
      });
    }
  }

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

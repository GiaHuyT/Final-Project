import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu thêm NHIỀU DỮ LIỆU TỔNG HỢP cho nhà cung cấp jahuy...');

  let jahuy = await prisma.user.findFirst({
    where: { 
      OR: [
        { username: { contains: 'jahuy' } },
        { email: { contains: 'jahuy' } }
      ]
    }
  });

  if (!jahuy) {
    console.error("Lỗi: Không tìm thấy user jahuy!");
    return;
  }

  const products = await prisma.product.findMany({
    where: { vendorId: jahuy.id }
  });

  if (products.length > 0) {
    let customer = await prisma.user.findFirst({
        where: { email: 'khachhang@example.com' }
    });
    if (!customer) {
        customer = await prisma.user.create({
            data: { username: 'Khách Hàng Vip', email: 'khachhang@example.com', password: '123', roles: ['CUSTOMER'] }
        });
    }

    // Tạo THÊM 10 Đơn hàng
    console.log("Đang tạo thêm 10 Đơn hàng...");
    const statuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    for (let i = 0; i < 10; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        await prisma.order.create({
            data: {
                customerId: customer.id,
                totalPrice: randomProduct.price,
                status: randomStatus,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000), // Random ngày trong tháng
                items: {
                    create: [
                        {
                            productId: randomProduct.id,
                            quantity: 1,
                            price: randomProduct.price
                        }
                    ]
                }
            }
        });
    }
  }

  let profile = await prisma.serviceProfile.findUnique({
    where: { userId: jahuy.id }
  });

  if (!profile) return;

  // Tạo THÊM 6 Xe cho thuê
  console.log("Đang tạo thêm 6 Xe cho thuê...");
  await prisma.rentalCar.createMany({
      data: [
          {
            profileId: profile.id,
            name: 'Rolls-Royce Ghost 2021',
            type: 'Siêu Sang',
            plate: '30H-111.11',
            price: 25000000,
            status: 'Sẵn sàng',
            description: 'Xe hoa đón dâu VIP nhất Vịnh Bắc Bộ.',
            imageUrl: 'https://images.unsplash.com/photo-1631560938661-8b3d6852bb6c?auto=format&fit=crop&q=80'
          },
          {
            profileId: profile.id,
            name: 'BMW i8 Roadster',
            type: 'Siêu Xe',
            plate: '51G-222.22',
            price: 15000000,
            status: 'Sẵn sàng',
            description: 'Trải nghiệm siêu xe mui trần cuối tuần dạo phố.',
            imageUrl: 'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?auto=format&fit=crop&q=80'
          },
          {
            profileId: profile.id,
            name: 'Kia Carnival Signature 2024',
            type: 'MPV 7 Chỗ',
            plate: '43C-333.33',
            price: 2500000,
            status: 'Đang cho thuê',
            description: 'Xe gia đình, đi du lịch xa thoải mái, cách âm tuyệt đối.',
            imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80'
          },
          {
            profileId: profile.id,
            name: 'Mazda CX-5 Premium 2023',
            type: 'Crossover 5 Chỗ',
            plate: '60A-444.44',
            price: 1200000,
            status: 'Sẵn sàng',
            description: 'Cho thuê tự lái thủ tục nhanh gọn trong 15 phút.',
            imageUrl: 'https://images.unsplash.com/photo-1552066344-2464c1135c32?auto=format&fit=crop&q=80'
          },
          {
            profileId: profile.id,
            name: 'Mercedes-Maybach S680',
            type: 'Sedan Siêu Sang',
            plate: '30K-555.55',
            price: 45000000,
            status: 'Đang bảo dưỡng',
            description: 'Xe phục vụ Hội nghị thượng đỉnh, nguyên thủ quốc gia.',
            imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80'
          },
          {
            profileId: profile.id,
            name: 'Toyota Fortuner Legender',
            type: 'SUV 7 Chỗ',
            plate: '51F-666.66',
            price: 1500000,
            status: 'Sẵn sàng',
            description: 'Chuyên đi tỉnh, đèo núi, công trường. Gầm cao máy thoáng.',
            imageUrl: 'https://images.unsplash.com/photo-1594502224748-0c6792348324?auto=format&fit=crop&q=80'
          }
      ]
  });

  // Tạo THÊM 5 Phiên đấu giá
  console.log("Đang tạo thêm 5 Phiên đấu giá...");
  await prisma.auction.createMany({
      data: [
          {
              vendorId: jahuy.id,
              title: 'Thanh lý Kho bãi - 5 Xe bán tải Ford Ranger',
              description: 'Đấu giá theo lô 5 chiếc Ford Ranger XLS 2020. Tình trạng hoạt động tốt.',
              startPrice: 2500000000,
              currentPrice: 2600000000,
              bidStep: 20000000,
              type: 'OFFLINE',
              startTime: new Date(Date.now() - 86400000 * 2), 
              endTime: new Date(Date.now() + 86400000 * 1), 
              status: 'ACTIVE'
          },
          {
            vendorId: jahuy.id,
            title: 'Livestream Đấu giá siêu bò Lamborghini Aventador LP700-4',
            description: 'Siêu xe mang biển số sảnh cực đẹp. Lên sóng livestream tối chủ nhật.',
            startPrice: 15000000000,
            currentPrice: 15000000000,
            bidStep: 100000000,
            type: 'LIVESTREAM',
            startTime: new Date(Date.now() + 86400000 * 2), 
            endTime: new Date(Date.now() + 86400000 * 3), 
            status: 'PENDING'
          },
          {
            vendorId: jahuy.id,
            title: 'Đấu giá xe tải Hino 8 Tấn (Xe Ngân hàng)',
            description: 'Xe tải thùng kín, Odo 40.000km.',
            startPrice: 750000000,
            currentPrice: 750000000,
            bidStep: 10000000,
            type: 'OFFLINE',
            startTime: new Date(Date.now() + 86400000 * 10), 
            endTime: new Date(Date.now() + 86400000 * 15), 
            status: 'PENDING'
          },
          {
            vendorId: jahuy.id,
            title: 'Porsche Macan 2021 Vỡ nợ thanh lý',
            description: 'Xe đẹp xuất sắc, không đâm đụng, thủ tục sang tên nhanh gọn.',
            startPrice: 2800000000,
            currentPrice: 3100000000,
            bidStep: 30000000,
            type: 'OFFLINE',
            startTime: new Date(Date.now() - 86400000 * 5), 
            endTime: new Date(Date.now() - 86400000 * 1), 
            status: 'COMPLETED'
          },
          {
            vendorId: jahuy.id,
            title: 'Livestream Xả kho Mini Cooper S 2022',
            description: 'Màu đỏ vô cùng cá tính. Mức giá khởi điểm cực kỳ hấp dẫn.',
            startPrice: 1600000000,
            currentPrice: 1750000000,
            bidStep: 15000000,
            type: 'LIVESTREAM',
            startTime: new Date(Date.now() - 86400000 * 10), 
            endTime: new Date(Date.now() - 86400000 * 8), 
            status: 'COMPLETED'
          }
      ]
  });

  console.log('✅ Đã NHỒI THÊM thành công lượng lớn dữ liệu vào các trang!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

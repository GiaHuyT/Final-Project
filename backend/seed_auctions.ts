import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu thêm NHIỀU ĐẤU GIÁ cho nhà cung cấp jahuy...');

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

  console.log('✅ Đã NHỒI THÊM thành công đấu giá vào các trang!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

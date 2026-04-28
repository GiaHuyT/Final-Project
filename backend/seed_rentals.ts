import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu tạo dữ liệu mẫu cho Thuê xe...');

  // 1. Tìm hoặc tạo 1 user để gắn vào ServiceProfile
  let user = await prisma.user.findFirst({
    where: { email: 'rental@autobid.vn' }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'AutoBid Rental',
        email: 'rental@autobid.vn',
        phonenumber: '0888888888',
        password: 'password123',
        roles: ['VENDOR'],
        isApprovedVendor: true
      }
    });
  }

  // 2. Tìm hoặc tạo ServiceProfile
  let profile = await prisma.serviceProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    profile = await prisma.serviceProfile.create({
      data: {
        userId: user.id,
        serviceType: 'VENDOR',
        isApproved: true
      }
    });
  }

  // 3. Xóa data cũ (tùy chọn)
  await prisma.rentalCar.deleteMany({});

  // 4. Tạo dữ liệu mẫu
  await prisma.rentalCar.createMany({
    data: [
      {
        profileId: profile.id,
        name: 'Toyota Camry 2023 (Tự lái)',
        type: 'Sedan 5 chỗ',
        plate: '30K-123.45',
        price: 1200000,
        status: 'Sẵn sàng',
        description: 'Xe mới 100%, trang bị đầy đủ cam hành trình, bảo hiểm thân vỏ. Giao xe tận nơi nội thành Hà Nội.',
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80'
      },
      {
        profileId: profile.id,
        name: 'Ford Everest Titanium 2024 (Có tài xế)',
        type: 'SUV 7 chỗ',
        plate: '51K-999.99',
        price: 1800000,
        status: 'Sẵn sàng',
        description: 'Phục vụ đưa đón sân bay, công tác tỉnh. Tài xế kinh nghiệm >10 năm, biết tiếng Anh giao tiếp.',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'
      },
      {
        profileId: profile.id,
        name: 'Kia Sedona Luxury 2022',
        type: 'MPV 7 chỗ',
        plate: '43A-567.89',
        price: 1500000,
        status: 'Đang bảo dưỡng',
        description: 'Rộng rãi, thoải mái cho gia đình đi du lịch. Có ghế massage, cửa sổ trời toàn cảnh.',
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80'
      },
      {
        profileId: profile.id,
        name: 'Mercedes S450 Luxury 2023',
        type: 'Xe sang 4 chỗ',
        plate: '30H-888.88',
        price: 5000000,
        status: 'Sẵn sàng',
        description: 'Chuyên phục vụ xe hoa, sự kiện VIP. Trọn gói 4 tiếng nội thành bao gồm hoa lụa cao cấp.',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80'
      },
      {
        profileId: profile.id,
        name: 'Hyundai Accent 2023 (Chạy dịch vụ)',
        type: 'Sedan 5 chỗ',
        plate: '60A-111.22',
        price: 600000,
        status: 'Sẵn sàng',
        description: 'Cho thuê theo tháng dành cho tài xế chạy công nghệ. Bao bảo dưỡng định kỳ.',
        imageUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&q=80'
      }
    ]
  });

  console.log('✅ Đã tạo thành công 5 dữ liệu mẫu cho danh sách Thuê xe!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

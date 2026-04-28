import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu tạo dữ liệu mẫu...');

  // 1. Tìm hoặc tạo 1 user để gắn vào ServiceProfile
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'AutoBid Gara',
        email: 'gara@autobid.vn',
        phonenumber: '0999999999',
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

  // 3. Xóa data cũ (tùy chọn, để tránh trùng)
  await prisma.repairCapacity.deleteMany({});

  // 4. Tạo dữ liệu mẫu
  await prisma.repairCapacity.createMany({
    data: [
      {
        profileId: profile.id,
        name: 'Trung tâm Cứu hộ AutoCare Miền Bắc',
        specialty: 'Động cơ, Hệ thống điện, Mâm lốp',
        experienceYears: 12,
        vehicleTypes: 'Xe con, Xe bán tải',
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        contactPhone: '0987123456',
        contactName: 'Anh Tuấn Auto',
        description: 'Chuyên đại tu động cơ, sửa chữa điện lạnh ô tô lưu động 24/7. Phục vụ cứu hộ khu vực nội thành Hà Nội trong 15 phút.',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80',
        status: 'Hoạt động'
      },
      {
        profileId: profile.id,
        name: 'Đội SOS Sài Gòn Mười Tín',
        specialty: 'Kéo xe, Kích bình, Vá vỏ lưu động',
        experienceYears: 8,
        vehicleTypes: 'Tất cả các loại xe',
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        contactPhone: '0901999888',
        contactName: 'Chú Mười Tín',
        description: 'Cứu hộ giao thông chuyên nghiệp, kéo xe tai nạn, cẩu kéo hạng nặng. Có xe chuyên dụng sàn trượt.',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80',
        status: 'Hoạt động'
      },
      {
        profileId: profile.id,
        name: 'Gara Chuyên Chăm Sóc Venza & Lexus',
        specialty: 'Chuẩn đoán lỗi ECU, Đồng sơn',
        experienceYears: 15,
        vehicleTypes: 'Xe con cao cấp (Lexus, Audi, BMW)',
        province: 'Đà Nẵng',
        district: 'Hải Châu',
        contactPhone: '0912111222',
        contactName: 'Chị Bình',
        description: 'Chuyên giải mã lỗi hệ thống điện tử trên xe sang. Phục hồi xe lỗi, nhập khẩu linh kiện chính hãng.',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80',
        status: 'Hoạt động'
      },
      {
        profileId: profile.id,
        name: 'Trạm Cứu Hộ Cao Tốc Pháp Vân',
        specialty: 'Cẩu kéo hạng nặng, Xử lý tai nạn',
        experienceYears: 5,
        vehicleTypes: 'Xe tải nặng, Container, Xe khách',
        province: 'Hà Nam',
        district: 'Duy Tiên',
        contactPhone: '0977888777',
        contactName: 'Tổ trực ban',
        description: 'Cứu hộ giao thông dọc tuyến cao tốc. Xử lý các sự cố nghiêm trọng, lật xe, rơi xuống hố.',
        imageUrl: 'https://images.unsplash.com/photo-1560935541-df071cb3cbcc?auto=format&fit=crop&q=80',
        status: 'Hoạt động'
      }
    ]
  });

  console.log('✅ Đã tạo thành công 4 dữ liệu mẫu cho danh sách Cứu hộ!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

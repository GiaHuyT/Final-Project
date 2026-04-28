import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu thêm XEM NHIỀU xe bán cho jahuy...');

  // 1. Tìm user jahuy
  let user = await prisma.user.findFirst({
    where: { 
      OR: [
        { username: { contains: 'jahuy' } },
        { email: { contains: 'jahuy' } }
      ]
    }
  });

  if (!user) {
    console.error("Lỗi: Không tìm thấy user jahuy!");
    return;
  }

  let category = await prisma.category.findFirst({
    where: { name: 'Xe Hơi' }
  });

  // KHÔNG xóa data cũ nữa, chỉ thêm mới vào

  // 4. Tạo các sản phẩm xe hơi thêm
  await prisma.product.createMany({
    data: [
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'Land Rover Range Rover Autobiography 2023',
        price: 11900000000,
        stock: 1,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80',
        description: 'Vua địa hình xứ sương mù. Bản full option trục cơ sở dài (LWB).',
        brand: 'Land Rover',
        modelName: 'Range Rover',
        variant: 'Autobiography LWB',
        year: 2023,
        condition: 'Xe mới',
        mileage: 0,
        color: 'Xanh Rêu',
        bodyType: 'SUV',
        fuelType: 'Xăng lai điện (MHEV)',
        engineCapacity: '3.0L V6',
        transmission: 'Tự động 8 cấp'
      },
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'Audi Q8 S-Line 2022',
        price: 4800000000,
        stock: 1,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80',
        description: 'SUV thể thao cá tính, thiết kế coupe vuốt đuôi đẹp mắt. Xe chính chủ giữ gìn cẩn thận.',
        brand: 'Audi',
        modelName: 'Q8',
        variant: 'S-Line',
        year: 2022,
        condition: 'Xe lướt',
        mileage: 18000,
        color: 'Trắng',
        bodyType: 'Crossover / SUV',
        fuelType: 'Xăng',
        engineCapacity: '3.0L V6 TFSI',
        transmission: 'Tự động 8 cấp Tiptronic'
      },
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'Bentley Flying Spur V8 2021',
        price: 18500000000,
        stock: 1,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1618038166542-a7202b21cd77?auto=format&fit=crop&q=80',
        description: 'Siêu phẩm siêu sang dành cho chủ tịch. Nội thất bọc da thủ công, ốp gỗ óc chó cao cấp.',
        brand: 'Bentley',
        modelName: 'Flying Spur',
        variant: 'V8',
        year: 2021,
        condition: 'Xe cũ',
        mileage: 12000,
        color: 'Xanh Đen (Onyx)',
        bodyType: 'Sedan',
        fuelType: 'Xăng',
        engineCapacity: '4.0L V8 Twin-Turbo',
        transmission: 'Tự động 8 cấp ly hợp kép'
      },
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'VinFast VF9 Plus 2023',
        price: 1650000000,
        stock: 5,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1698207164923-d6ce50c8227b?auto=format&fit=crop&q=80',
        description: 'Xe điện SUV Full-size 7 chỗ rộng rãi. Có sẵn giao ngay, đã bao gồm pin.',
        brand: 'VinFast',
        modelName: 'VF9',
        variant: 'Plus',
        year: 2023,
        condition: 'Xe mới',
        mileage: 0,
        color: 'Xám',
        bodyType: 'SUV',
        fuelType: 'Điện',
        engineCapacity: 'Mô-tơ điện kép',
        transmission: 'Tự động (1 cấp)'
      },
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'Maserati Ghibli 2020',
        price: 3200000000,
        stock: 1,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1610486744888-294b2a37fbd2?auto=format&fit=crop&q=80',
        description: 'Mẫu sedan thể thao mang linh hồn Ferrari. Tiếng ống xả phấn khích.',
        brand: 'Maserati',
        modelName: 'Ghibli',
        variant: 'Base',
        year: 2020,
        condition: 'Xe cũ',
        mileage: 45000,
        color: 'Đỏ',
        bodyType: 'Sedan',
        fuelType: 'Xăng',
        engineCapacity: '3.0L V6 Twin-Turbo',
        transmission: 'Tự động 8 cấp ZF'
      },
      {
        vendorId: user.id,
        categoryId: category!.id,
        name: 'Ford Mustang GT 5.0 V8 2021',
        price: 3500000000,
        stock: 1,
        status: true,
        imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80',
        description: 'Cơ bắp Mỹ chính hiệu. Nhập khẩu tư nhân. Lên sẵn pô Corsa nổ uy lực.',
        brand: 'Ford',
        modelName: 'Mustang',
        variant: 'GT V8',
        year: 2021,
        condition: 'Xe lướt',
        mileage: 22000,
        color: 'Vàng',
        bodyType: 'Coupe',
        fuelType: 'Xăng',
        engineCapacity: '5.0L V8 Coyote',
        transmission: 'Tự động 10 cấp'
      }
    ]
  });

  console.log('✅ Đã tạo THÊM 6 chiếc xe siêu hot cho jahuy!');

  // Tạo THÊM 5 Phiên đấu giá
  console.log("Đang tạo thêm 5 Phiên đấu giá...");
  const vendorProducts = await prisma.product.findMany({ where: { vendorId: user.id } });
  const pId = vendorProducts.length > 0 ? vendorProducts[0].id : 1;

  await prisma.auction.create({
    data: {
      vendorId: user.id,
      title: 'Thanh lý Kho bãi - 5 Xe bán tải Ford Ranger',
      description: 'Đấu giá theo lô 5 chiếc Ford Ranger XLS 2020. Tình trạng hoạt động tốt.',
      startPrice: 2500000000,
      currentPrice: 2600000000,
      bidStep: 20000000,
      type: 'OFFLINE',
      startTime: new Date(Date.now() - 86400000 * 2), 
      endTime: new Date(Date.now() + 86400000 * 1), 
      status: 'ACTIVE',
      items: { create: [{ productId: pId }] }
    }
  });

  await prisma.auction.create({
    data: {
      vendorId: user.id,
      title: 'Livestream Đấu giá siêu bò Lamborghini Aventador LP700-4',
      description: 'Siêu xe mang biển số sảnh cực đẹp. Lên sóng livestream tối chủ nhật.',
      startPrice: 15000000000,
      currentPrice: 15000000000,
      bidStep: 100000000,
      type: 'LIVESTREAM',
      startTime: new Date(Date.now() + 86400000 * 2), 
      endTime: new Date(Date.now() + 86400000 * 3), 
      status: 'PENDING',
      items: { create: [{ productId: vendorProducts.length > 1 ? vendorProducts[1].id : pId }] }
    }
  });

  await prisma.auction.create({
    data: {
      vendorId: user.id,
      title: 'Đấu giá xe tải Hino 8 Tấn (Xe Ngân hàng)',
      description: 'Xe tải thùng kín, Odo 40.000km.',
      startPrice: 750000000,
      currentPrice: 750000000,
      bidStep: 10000000,
      type: 'OFFLINE',
      startTime: new Date(Date.now() + 86400000 * 10), 
      endTime: new Date(Date.now() + 86400000 * 15), 
      status: 'PENDING',
      items: { create: [{ productId: vendorProducts.length > 2 ? vendorProducts[2].id : pId }] }
    }
  });

  await prisma.auction.create({
    data: {
      vendorId: user.id,
      title: 'Porsche Macan 2021 Vỡ nợ thanh lý',
      description: 'Xe đẹp xuất sắc, không đâm đụng, thủ tục sang tên nhanh gọn.',
      startPrice: 2800000000,
      currentPrice: 3100000000,
      bidStep: 30000000,
      type: 'OFFLINE',
      startTime: new Date(Date.now() - 86400000 * 5), 
      endTime: new Date(Date.now() - 86400000 * 1), 
      status: 'COMPLETED',
      items: { create: [{ productId: vendorProducts.length > 3 ? vendorProducts[3].id : pId }] }
    }
  });

  await prisma.auction.create({
    data: {
      vendorId: user.id,
      title: 'Livestream Xả kho Mini Cooper S 2022',
      description: 'Màu đỏ vô cùng cá tính. Mức giá khởi điểm cực kỳ hấp dẫn.',
      startPrice: 1600000000,
      currentPrice: 1750000000,
      bidStep: 15000000,
      type: 'LIVESTREAM',
      startTime: new Date(Date.now() - 86400000 * 10), 
      endTime: new Date(Date.now() - 86400000 * 8), 
      status: 'COMPLETED',
      items: { create: [{ productId: vendorProducts.length > 4 ? vendorProducts[4].id : pId }] }
    }
  });

  console.log('✅ Đã tạo THÊM 5 phiên đấu giá (CÓ HÌNH ẢNH) cho jahuy!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

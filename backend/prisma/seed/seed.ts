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
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
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

  const vendor1 = await prisma.user.create({
    data: {
      username: 'vendor1',
      email: 'vendor1@example.com',
      password: hashedPassword,
      role: Role.VENDOR,
      isApprovedVendor: true,
    },
  });

  const vendor2 = await prisma.user.create({
    data: {
      username: 'vendor2',
      email: 'vendor2@example.com',
      password: hashedPassword,
      role: Role.VENDOR,
      isApprovedVendor: true,
    },
  });

  const vendor3 = await prisma.user.create({
    data: {
      username: 'vendor3',
      email: 'vendor3@example.com',
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

  // 2. Tạo Category cơ bản
  const defaultCategory = await prisma.category.create({
    data: { name: 'Ô tô' },
  });

  // 3. Tạo dữ liệu Hãng, Dòng xe & Phiên bản
  const carData = [
    { brand: 'Toyota', models: [{ name: 'Vios', variants: ['E MT', 'E CVT', 'G CVT'] }, { name: 'Camry', variants: ['2.0G', '2.0Q', '2.5Q'] }, { name: 'Corolla Altis', variants: ['1.8G', '1.8V', 'Hybrid'] }, { name: 'Fortuner', variants: ['2.4 MT', '2.4 AT', '2.8 AT 4x4'] }, { name: 'Hilux', variants: ['2.4E MT', '2.4E AT', 'Adventure'] }, { name: 'Land Cruiser', variants: ['VX', 'ZX'] }, { name: 'Yaris Cross', variants: ['G', 'Hybrid'] }, { name: 'Raize', variants: ['G', 'Turbo'] }, { name: 'Innova', variants: ['E', 'G', 'Venturer'] }] },
    { brand: 'Honda', models: [{ name: 'City', variants: ['G', 'L', 'RS'] }, { name: 'Civic', variants: ['E', 'G', 'RS'] }, { name: 'Accord', variants: ['1.5 Turbo'] }, { name: 'CR-V', variants: ['G', 'L', 'L AWD'] }, { name: 'HR-V', variants: ['G', 'L', 'RS'] }, { name: 'BR-V', variants: ['G', 'L'] }, { name: 'Jazz', variants: ['V', 'RS'] }, { name: 'Pilot', variants: ['Elite'] }] },
    { brand: 'Hyundai', models: [{ name: 'Accent', variants: ['MT', 'AT', 'AT ĐB'] }, { name: 'Elantra', variants: ['1.6 AT', '2.0 AT', 'Sport'] }, { name: 'Sonata', variants: ['2.0', '2.5'] }, { name: 'Tucson', variants: ['Xăng', 'Dầu', 'Turbo'] }, { name: 'Santa Fe', variants: ['Exclusive', 'Prestige', 'Calligraphy'] }, { name: 'Creta', variants: ['Tiêu chuẩn', 'Đặc biệt', 'Cao cấp'] }, { name: 'Kona', variants: ['2.0 AT', '1.6 Turbo'] }, { name: 'Palisade', variants: ['Exclusive', 'Prestige'] }] },
    { brand: 'Kia', models: [{ name: 'Morning', variants: ['MT', 'AT', 'GT-Line'] }, { name: 'Cerato', variants: ['1.6 MT', '1.6 AT', '2.0 AT'] }, { name: 'K5', variants: ['2.0 Luxury', '2.0 Premium', '2.5 GT-Line'] }, { name: 'Seltos', variants: ['Deluxe', 'Luxury', 'Premium'] }, { name: 'Sportage', variants: ['2.0', '2.0 Diesel'] }, { name: 'Sorento', variants: ['Luxury', 'Premium', 'Signature'] }, { name: 'Carnival', variants: ['Luxury', 'Premium'] }, { name: 'Sonet', variants: ['Deluxe', 'Luxury'] }] },
    { brand: 'Mazda', models: [{ name: 'Mazda2', variants: ['1.5 AT'] }, { name: 'Mazda3', variants: ['Deluxe', 'Luxury', 'Premium'] }, { name: 'Mazda6', variants: ['2.0', '2.5'] }, { name: 'CX-3', variants: ['Luxury', 'Premium'] }, { name: 'CX-30', variants: ['Luxury', 'Premium'] }, { name: 'CX-5', variants: ['Deluxe', 'Luxury', 'Premium'] }, { name: 'CX-8', variants: ['Luxury', 'Premium'] }, { name: 'CX-9', variants: ['Signature'] }] },
    { brand: 'Ford', models: [{ name: 'Ranger', variants: ['XL', 'XLS', 'Wildtrak', 'Raptor'] }, { name: 'Everest', variants: ['Ambiente', 'Sport', 'Titanium'] }, { name: 'Explorer', variants: ['Limited'] }, { name: 'Escape', variants: ['1.5', '2.0'] }, { name: 'Focus', variants: ['Trend', 'Sport'] }, { name: 'Mustang', variants: ['2.3L', 'GT'] }, { name: 'F-150', variants: ['XLT', 'Lariat'] }] },
    { brand: 'BMW', models: [{ name: '1 Series', variants: ['118i'] }, { name: '3 Series', variants: ['320i', '330i'] }, { name: '5 Series', variants: ['520i', '530i'] }, { name: '7 Series', variants: ['730Li', '740Li'] }, { name: 'X1', variants: ['sDrive18i'] }, { name: 'X3', variants: ['xDrive20i', 'xDrive30i'] }, { name: 'X5', variants: ['xDrive40i'] }, { name: 'X7', variants: ['xDrive40i'] }] },
    { brand: 'Mercedes-Benz', models: [{ name: 'A-Class', variants: ['A200', 'A250'] }, { name: 'C-Class', variants: ['C200', 'C300 AMG'] }, { name: 'E-Class', variants: ['E200', 'E300 AMG'] }, { name: 'S-Class', variants: ['S450', 'S500'] }, { name: 'GLA', variants: ['GLA200'] }, { name: 'GLC', variants: ['GLC200', 'GLC300'] }, { name: 'GLE', variants: ['GLE450'] }, { name: 'GLS', variants: ['GLS450'] }] },
    { brand: 'VinFast', models: [{ name: 'Fadil', variants: ['Base', 'Plus'] }, { name: 'Lux A2.0', variants: ['Tiêu chuẩn', 'Nâng cao'] }, { name: 'Lux SA2.0', variants: ['Tiêu chuẩn', 'Nâng cao'] }, { name: 'VF e34', variants: ['Standard'] }, { name: 'VF 5', variants: ['Plus'] }, { name: 'VF 6', variants: ['Eco', 'Plus'] }, { name: 'VF 7', variants: ['Eco', 'Plus'] }, { name: 'VF 8', variants: ['Eco', 'Plus'] }, { name: 'VF 9', variants: ['Eco', 'Plus'] }] },
    { brand: 'Tesla', models: [{ name: 'Model 3', variants: ['RWD', 'Long Range', 'Performance'] }, { name: 'Model Y', variants: ['Long Range', 'Performance'] }, { name: 'Model S', variants: ['Dual Motor', 'Plaid'] }, { name: 'Model X', variants: ['Dual Motor', 'Plaid'] }, { name: 'Cybertruck', variants: ['RWD', 'AWD', 'Cyberbeast'] }] },
    { brand: 'Audi', models: [{ name: 'A3', variants: ['35 TFSI', '40 TFSI'] }, { name: 'A4', variants: ['40 TFSI', '45 TFSI'] }, { name: 'A6', variants: ['45 TFSI', '55 TFSI'] }, { name: 'A8', variants: ['L 55 TFSI'] }, { name: 'Q3', variants: ['35 TFSI', '40 TFSI'] }, { name: 'Q5', variants: ['45 TFSI'] }, { name: 'Q7', variants: ['45 TFSI', '55 TFSI'] }, { name: 'Q8', variants: ['55 TFSI'] }] },
    { brand: 'Lexus', models: [{ name: 'IS', variants: ['300', '350 F Sport'] }, { name: 'ES', variants: ['250', '300h'] }, { name: 'LS', variants: ['500', '500h'] }, { name: 'NX', variants: ['250', '350 F Sport'] }, { name: 'RX', variants: ['350', '500h'] }, { name: 'GX', variants: ['460'] }, { name: 'LX', variants: ['600'] }] },
    { brand: 'Volkswagen', models: [{ name: 'Polo', variants: ['Trendline', 'Comfortline'] }, { name: 'Golf', variants: ['TSI', 'GTI'] }, { name: 'Passat', variants: ['Comfort', 'Highline'] }, { name: 'Jetta', variants: ['Comfortline'] }, { name: 'Tiguan', variants: ['Elegance', 'Luxury'] }, { name: 'Touareg', variants: ['Luxury'] }, { name: 'T-Cross', variants: ['Style'] }] },
    { brand: 'Volvo', models: [{ name: 'S60', variants: ['B5', 'Recharge'] }, { name: 'S90', variants: ['B6'] }, { name: 'XC40', variants: ['Recharge'] }, { name: 'XC60', variants: ['B6', 'Recharge'] }, { name: 'XC90', variants: ['B6', 'Recharge'] }, { name: 'V60', variants: ['Cross Country'] }, { name: 'V90', variants: ['Cross Country'] }] },
    { brand: 'Subaru', models: [{ name: 'Impreza', variants: ['2.0i'] }, { name: 'Legacy', variants: ['2.5i'] }, { name: 'Forester', variants: ['i-S', 'i-L'] }, { name: 'Outback', variants: ['2.5i', 'XT'] }, { name: 'Crosstrek', variants: ['2.0i'] }, { name: 'WRX', variants: ['MT', 'CVT'] }, { name: 'BRZ', variants: ['Premium'] }] },
    { brand: 'Peugeot', models: [{ name: '208', variants: ['Active', 'Allure'] }, { name: '308', variants: ['Allure', 'GT'] }, { name: '408', variants: ['Premium', 'GT'] }, { name: '508', variants: ['GT'] }, { name: '2008', variants: ['Active', 'GT'] }, { name: '3008', variants: ['Allure', 'GT'] }, { name: '5008', variants: ['Allure', 'GT'] }] },
    { brand: 'Land Rover', models: [{ name: 'Range Rover', variants: ['SE', 'Autobiography'] }, { name: 'Range Rover Sport', variants: ['SE', 'Dynamic'] }, { name: 'Defender', variants: ['90', '110'] }, { name: 'Discovery', variants: ['SE'] }, { name: 'Discovery Sport', variants: ['S', 'R-Dynamic'] }] },
    { brand: 'Porsche', models: [{ name: '911', variants: ['Carrera', 'Turbo S'] }, { name: 'Cayenne', variants: ['Standard', 'Turbo'] }, { name: 'Macan', variants: ['Standard', 'GTS'] }, { name: 'Panamera', variants: ['4', 'Turbo'] }, { name: 'Taycan', variants: ['4S', 'Turbo'] }] },
    { brand: 'BYD', models: [{ name: 'Dolphin', variants: ['Standard', 'Extended'] }, { name: 'Atto 3', variants: ['Dynamic', 'Premium'] }, { name: 'Seal', variants: ['RWD', 'AWD'] }, { name: 'Han', variants: ['EV'] }, { name: 'Tang', variants: ['EV AWD'] }] },
    { brand: 'MG', models: [{ name: 'ZS', variants: ['Standard', 'Luxury'] }, { name: 'HS', variants: ['1.5T', '2.0T'] }, { name: 'MG5', variants: ['STD', 'LUX'] }, { name: 'MG7', variants: ['Premium'] }, { name: 'Cyberster', variants: ['EV'] }] }
  ];

  for (const item of carData) {
    const brand = await prisma.brand.create({
      data: { name: item.brand }
    });
    for (const model of item.models) {
      const createdModel = await prisma.carModel.create({
        data: { name: model.name, brandId: brand.id }
      });
      if (model.variants) {
        for (const variant of model.variants) {
          await prisma.carVariant.create({
            data: { name: variant, modelId: createdModel.id }
          });
        }
      }
    }
  }

  // Helper to get realistic specs for the seeded cars
  const getSpecsForModel = (brand: string, modelName: string) => {
    const specs = {
      fuelType: 'Xăng', engineCapacity: '2.0', maxPower: '150', maxTorque: '200', transmission: '6AT', driveType: 'FWD',
      length: 4500.0, width: 1800.0, height: 1500.0, wheelbase: 2700.0, groundClearance: 150.0, curbWeight: 1300.0, fuelTankCapacity: 50.0, avgFuelConsumption: 7.5,
      bodyType: 'Sedan', airbags: 6, autoConditioning: true, infotainment: true, appleCarplay: true, electricSeats: false, camera360: false,
      abs: true, esp: true, ba: true, rearSensor: true
    };
    
    switch(modelName) {
      case 'Vios': case 'City': case 'Accent': case 'Mazda2':
        return { ...specs, engineCapacity: '1.5', maxPower: '107', maxTorque: '140', transmission: 'CVT', length: 4425, width: 1730, height: 1475, wheelbase: 2550, groundClearance: 133, curbWeight: 1100, fuelTankCapacity: 42, avgFuelConsumption: 5.8, bodyType: 'Sedan' };
      case 'Camry': case 'Accord': case 'Mazda6': case 'K5':
        return { ...specs, engineCapacity: '2.5', maxPower: '207', maxTorque: '250', transmission: '8AT', length: 4885, width: 1840, height: 1445, wheelbase: 2825, groundClearance: 140, curbWeight: 1550, fuelTankCapacity: 60, avgFuelConsumption: 7.1, bodyType: 'Sedan', electricSeats: true, camera360: true, airbags: 7 };
      case 'Fortuner': case 'Everest': case 'Santa Fe': case 'Sorento':
        return { ...specs, fuelType: 'Diesel', engineCapacity: '2.4', maxPower: '150', maxTorque: '400', transmission: '6AT', driveType: 'AWD', length: 4795, width: 1855, height: 1835, wheelbase: 2745, groundClearance: 279, curbWeight: 2000, fuelTankCapacity: 80, avgFuelConsumption: 8.5, bodyType: 'SUV', electricSeats: true, airbags: 7 };
      case 'Ranger': case 'Hilux':
        return { ...specs, fuelType: 'Diesel', engineCapacity: '2.0', maxPower: '210', maxTorque: '500', transmission: '10AT', driveType: '4WD', length: 5362, width: 1918, height: 1875, wheelbase: 3270, groundClearance: 235, curbWeight: 2200, fuelTankCapacity: 80, avgFuelConsumption: 8.0, bodyType: 'Pickup', airbags: 7 };
      case 'Model 3': case 'Model Y': case 'VF e34': case 'VF 8':
        return { ...specs, fuelType: 'Điện', engineCapacity: null, maxPower: '283', maxTorque: '420', transmission: '1AT', driveType: 'AWD', length: 4694, width: 1849, height: 1443, wheelbase: 2875, groundClearance: 140, curbWeight: 1765, fuelTankCapacity: null, avgFuelConsumption: null, bodyType: 'Sedan', electricSeats: true, camera360: true, airbags: 8 };
      case '911': case 'Mustang':
        return { ...specs, fuelType: 'Xăng', engineCapacity: '3.0', maxPower: '379', maxTorque: '450', transmission: '8PDK', driveType: 'RWD', length: 4519, width: 1852, height: 1298, wheelbase: 2450, groundClearance: 110, curbWeight: 1500, fuelTankCapacity: 64, avgFuelConsumption: 10.5, bodyType: 'Coupe', electricSeats: true, camera360: true };
      case 'GLC': case 'X3': case 'Q5': case 'Macan':
        return { ...specs, engineCapacity: '2.0', maxPower: '258', maxTorque: '400', transmission: '9AT', driveType: 'AWD', length: 4655, width: 1890, height: 1644, wheelbase: 2873, groundClearance: 150, curbWeight: 1800, fuelTankCapacity: 66, avgFuelConsumption: 8.2, bodyType: 'SUV', electricSeats: true, camera360: true };
      case 'S-Class': case '7 Series': case 'Panamera':
        return { ...specs, engineCapacity: '3.0', maxPower: '367', maxTorque: '500', transmission: '9AT', driveType: 'AWD', length: 5289, width: 1954, height: 1503, wheelbase: 3216, groundClearance: 130, curbWeight: 2000, fuelTankCapacity: 76, avgFuelConsumption: 9.5, bodyType: 'Sedan', electricSeats: true, camera360: true };
      case 'CX-5': case 'CR-V': case 'Tucson':
        return { ...specs, engineCapacity: '2.0', maxPower: '154', maxTorque: '200', transmission: '6AT', driveType: 'FWD', length: 4550, width: 1840, height: 1680, wheelbase: 2700, groundClearance: 200, curbWeight: 1550, fuelTankCapacity: 56, avgFuelConsumption: 7.2, bodyType: 'SUV', electricSeats: true, camera360: true };
      default:
        if (brand === 'Toyota' || brand === 'Honda') return { ...specs, engineCapacity: '1.8', maxPower: '138', maxTorque: '172', transmission: 'CVT', length: 4500, bodyType: 'Sedan' };
        if (brand === 'Ford' || brand === 'Hyundai') return { ...specs, engineCapacity: '2.0', maxPower: '180', maxTorque: '250', bodyType: 'SUV', driveType: 'AWD' };
        if (brand === 'VinFast' || brand === 'Tesla' || brand === 'BYD') return { ...specs, fuelType: 'Điện', engineCapacity: null, maxPower: '200', maxTorque: '300', bodyType: 'SUV' };
        if (brand === 'Mercedes-Benz' || brand === 'BMW' || brand === 'Audi' || brand === 'Porsche') return { ...specs, engineCapacity: '3.0', maxPower: '340', maxTorque: '450', transmission: '8AT', bodyType: 'SUV', electricSeats: true, camera360: true };
        return specs;
    }
  };

  // 4. Tạo Sản phẩm mẫu cho các Vendor
  console.log('Đang tạo 60+ sản phẩm mẫu...');
  const vendors = [vendor1, vendor2, vendor3];
  const products = [];
  let productIndex = 0;

  for (const item of carData) {
    const brandName = item.brand;
    // Lấy tối đa 3 model cho mỗi hãng
    const modelsToCreate = item.models.slice(0, 3);
    
    for (const model of modelsToCreate) {
      const vendor = vendors[productIndex % vendors.length];
      const variant = model.variants[0] || 'Standard';
      const year = 2023 + (productIndex % 2); // 2023 or 2024
      
      // Determine image based on brand/type
      let imageUrl = '/images/cars/white_luxury_sedan.png';
      if (['SUV', 'Fortuner', 'Everest', 'Santa Fe', 'CR-V', 'GLC', 'RX', 'Tucson'].some(kw => model.name.includes(kw) || item.brand.includes(kw))) {
        imageUrl = '/images/cars/black_modern_suv.png';
      } else if (['EV', 'VinFast', 'Tesla', 'BYD', 'Seal', 'Model 3'].some(kw => model.name.includes(kw) || item.brand.includes(kw))) {
        imageUrl = '/images/cars/blue_electric_sedan.png';
      } else if (['Porsche', '911', 'Mustang', 'Sport', 'Supercar'].some(kw => model.name.includes(kw))) {
        imageUrl = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800';
      } else if (['Ranger', 'Hilux', 'Pickup', 'F-150'].some(kw => model.name.includes(kw))) {
        imageUrl = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800';
      } else if (productIndex % 5 === 0) {
        imageUrl = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800';
      } else if (productIndex % 5 === 1) {
        imageUrl = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800';
      } else if (productIndex % 5 === 2) {
        imageUrl = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800';
      } else if (productIndex % 5 === 3) {
        imageUrl = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800';
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800';
      }

      // Base price by brand category
      let basePrice = 600000000; // 600M
      if (['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover', 'Lexus', 'Volvo'].includes(brandName)) {
        basePrice = 2000000000; // 2B
      }
      const finalPrice = basePrice + (productIndex * 50000000); // Increment price slightly

      products.push({
        name: `${brandName} ${model.name} ${variant} ${year}`,
        description: `Mẫu xe ${model.name} phiên bản ${variant} của ${brandName}. Thiết kế đẳng cấp, vận hành mạnh mẽ, đầy đủ tiện nghi hiện đại.`,
        price: finalPrice,
        stock: 1 + (productIndex % 5),
        vendorId: vendor.id,
        categoryId: defaultCategory.id,
        brand: brandName,
        modelName: model.name,
        variant: variant,
        year: year,
        condition: productIndex % 4 === 0 ? 'Xe lướt' : 'Xe mới',
        imageUrl: imageUrl,
        ...getSpecsForModel(brandName, model.name)
      });

      productIndex++;
    }
  }

  await prisma.product.createMany({
    data: products,
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

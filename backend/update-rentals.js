const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockImages = [
  '/images/mock/honda_vision.png',
  '/images/mock/toyota_vios.png',
  '/images/mock/kia_sorento.png',
  '/images/mock/yamaha_exciter.png',
  '/images/mock/mazda_3.png'
];

async function update() {
  const cars = await prisma.rentalCar.findMany();
  for (let i = 0; i < cars.length; i++) {
    const imageUrl = mockImages[i % mockImages.length];
    await prisma.rentalCar.update({
      where: { id: cars[i].id },
      data: { imageUrl }
    });
    console.log('Updated car', cars[i].id, 'with', imageUrl);
  }
}

update().catch(console.error).finally(() => prisma.$disconnect());

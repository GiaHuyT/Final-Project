import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.auction.updateMany({
    where: {
      status: 'CANCELLED',
      bids: {
        none: {}
      }
    },
    data: {
      status: 'FINISHED'
    }
  });
  console.log(`Updated ${result.count} auctions from CANCELLED to FINISHED.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

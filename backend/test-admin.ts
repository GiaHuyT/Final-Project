import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { roles: ['ADMIN', 'CUSTOMER'] },
  });
  console.log('Updated user roles:', user.roles);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

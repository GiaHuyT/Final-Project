import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
        where: { id: 5 },
        select: { id: true, username: true, role: true }
    });
    console.log('USER_CHECK_RESULT:', JSON.stringify(user));
    await prisma.$disconnect();
}

main();

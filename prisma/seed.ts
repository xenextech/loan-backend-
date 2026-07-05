import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 12);

  const users = [
    {
      email: 'initiator@yopmail.com',
      role: UserRole.INITIATOR,
    },
    {
      email: 'approver@yopmail.com',
      role: UserRole.APPROVER,
    },
    {
      email: 'supporter@yopmail.com',
      role: UserRole.SUPPORTER,
    },
    {
      email: 'creditmanager@yopmail.com',
      role: UserRole.CREDIT_MANAGER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        role: user.role,
        passwordHash,
        isEmailVerified: true,
      },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
        isEmailVerified: true,
      },
    });
  }

  console.log(' Seed completed successfully.');
  console.log('Default Password:', password);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

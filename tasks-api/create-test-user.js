
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = 'testpassword';
  const password_hash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password_hash: password_hash,
    },
  });
  console.log('Created user:', user.username);
  console.log('Password hash:', user.password_hash);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

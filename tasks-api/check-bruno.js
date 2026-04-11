
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'bruno' },
  });
  
  if (!user) {
    console.log('User bruno not found');
    return;
  }

  console.log(`User: ${user.username}`);
  console.log(`Hash: ${user.password_hash}`);
  
  // Try common passwords
  const passwords = ['admin', '123456', 'bruno', 'felipe', 'password'];
  for (const p of passwords) {
    try {
      const match = await bcrypt.compare(p, user.password_hash);
      console.log(`Password "${p}" match? ${match}`);
      if (match) break;
    } catch (e) {
      console.log(`Error comparing "${p}": ${e.message}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

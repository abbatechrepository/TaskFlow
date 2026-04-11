
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'felipe';
  const pass = 'admin123';
  
  const user = await prisma.user.findUnique({
    where: { username },
  });
  
  if (!user) {
    console.log('User felipe not found');
    return;
  }

  const isMatch = await bcrypt.compare(pass, user.password_hash);
  console.log('Final verification for felipe/admin123:', isMatch ? 'SUCCESS' : 'FAILED');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

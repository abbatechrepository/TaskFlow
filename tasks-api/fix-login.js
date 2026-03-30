
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = 'admin123';
  const password_hash = await bcrypt.hash(password, 10);
  
  // Update felipe's password
  const user = await prisma.user.update({
    where: { username: 'felipe' },
    data: { password_hash },
  });
  console.log('Updated user felipe with new hash');
  
  // Remove testuser
  try {
    await prisma.user.delete({ where: { username: 'testuser' } });
    console.log('Removed testuser');
  } catch (e) {
    console.log('testuser not found or already deleted');
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

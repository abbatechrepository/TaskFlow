const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ where: { username: 'felipe' } });
  console.log('User felipe hash:', user?.password_hash);
  
  const isMatch = await bcrypt.compare('admin123', user?.password_hash);
  console.log('felipe / admin123 match?', isMatch);
}

checkUser().finally(() => prisma.$disconnect());

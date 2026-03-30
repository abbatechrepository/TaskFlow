
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    let match = false;
    // Mocking some common passwords if they are plain text
    if (user.password_hash === 'seisa91seise23') {
        // Just checking if we can verify it at all
        console.log(`User: ${user.username}, Hash: ${user.password_hash} (PLAIN?)`);
    } else {
        try {
            // For 'bruno', let's assume password might be 'admin' or '123456' or 'bruno'
            const passwords = ['admin', '123456', 'bruno', 'testpassword'];
            for (const p of passwords) {
                if (await bcrypt.compare(p, user.password_hash)) {
                    console.log(`User: ${user.username}, Password identified: ${p}`);
                    match = true;
                    break;
                }
            }
            if (!match) {
                console.log(`User: ${user.username}, Hash: ${user.password_hash} (BCRYPT - NO MATCH)`);
            }
        } catch (e) {
            console.log(`User: ${user.username}, Error comparing: ${e.message}`);
        }
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

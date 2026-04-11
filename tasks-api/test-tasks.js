
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTasks() {
  console.log('--- START VERIFICATION ---');
  try {
    const tasks = await prisma.task.findMany();
    console.log('SUCCESS: findMany worked, count:', tasks.length);
    
    // Testing dashboard logic with dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueList = tasks.filter((t) => {
        if (!t.due_date || t.status === 'Concluída') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
    });
    console.log('SUCCESS: date filtering worked, overdue:', overdueList.length);

  } catch (e) {
    console.error('--- ERROR ---');
    console.error(e.message);
  }
}

testTasks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

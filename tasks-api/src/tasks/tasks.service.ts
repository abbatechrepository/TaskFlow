import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [total, inProgress, done, tasks] = await Promise.all([
        this.prisma.task.count(),
        this.prisma.task.count({ where: { status: 'Em andamento' } }),
        this.prisma.task.count({ where: { status: 'Concluída' } }),
        this.prisma.task.findMany(),
      ]);

      const overdueList = tasks.filter((t) => {
        if (!t.due_date || t.status === 'Concluída') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      });

      const overdue = overdueList.length;

      // Developer stats
      const developers = await this.prisma.user.findMany({ select: { name: true } });
      const devMap = new Map<string, number>();
      developers.forEach((d) => devMap.set(d.name, 0));

      const tasksWithDev = await this.prisma.task.findMany({
        where: { developer: { not: null, notIn: [''] } },
        select: { developer: true },
      });

      tasksWithDev.forEach((t) => {
        if (t.developer && devMap.has(t.developer)) {
          devMap.set(t.developer, (devMap.get(t.developer) || 0) + 1);
        }
      });

      const devs = Array.from(devMap.entries()).map(([developer, total]) => ({ developer, total }));

      return { total, inProgress, done, overdue, devs, overdueList };
    } catch (error) {
      console.error('Error in getDashboard:', error);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.task.findMany({ orderBy: { id: 'desc' } });
  }

  async create(data: any) {
    const { due_date, ...rest } = data;
    return this.prisma.task.create({
      data: {
        ...rest,
        due_date: due_date ? new Date(due_date) : null,
      },
    });
  }

  async update(id: number, data: any) {
    const { due_date, ...rest } = data;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        due_date: due_date ? new Date(due_date) : null,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}

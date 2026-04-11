import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskPayloadDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private normalizeAssigneeIds(ids?: number[]) {
    if (!Array.isArray(ids)) return [];

    return Array.from(
      new Set(
        ids
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );
  }

  private mapTask(task: any) {
    const developers = task.assignees?.map((assignment: any) => assignment.user.name) ?? [];
    const assigneeIds = task.assignees?.map((assignment: any) => assignment.user.id) ?? [];
    const { assignees, ...taskData } = task;

    return {
      ...taskData,
      developer: developers,
      assigneeIds,
    };
  }

  async getDashboard() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [total, inProgress, done, tasks] = await Promise.all([
        this.prisma.task.count(),
        this.prisma.task.count({ where: { status: 'Em andamento' } }),
        this.prisma.task.count({ where: { status: 'Concluída' } }),
        this.prisma.task.findMany({
          include: {
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
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

      tasks.forEach((task) => {
        task.assignees.forEach((assignment) => {
          const developer = assignment.user.name;

          if (devMap.has(developer)) {
            devMap.set(developer, (devMap.get(developer) || 0) + 1);
          }
        });
      });

      const devs = Array.from(devMap.entries()).map(([developer, total]) => ({ developer, total }));

      return {
        total,
        inProgress,
        done,
        overdue,
        devs,
        overdueList: overdueList.map((task) => this.mapTask(task)),
      };
    } catch (error) {
      console.error('Error in getDashboard:', error);
      throw error;
    }
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany({
      orderBy: { id: 'desc' },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return tasks.map((task) => this.mapTask(task));
  }

  async create(data: TaskPayloadDto) {
    const { due_date, assigneeIds, ...rest } = data;
    const normalizedAssigneeIds = this.normalizeAssigneeIds(assigneeIds);

    const task = await this.prisma.task.create({
      data: {
        ...rest,
        due_date: due_date ? new Date(due_date) : null,
        assignees: {
          create: normalizedAssigneeIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return this.mapTask(task);
  }

  async update(id: number, data: TaskPayloadDto) {
    const { due_date, assigneeIds, ...rest } = data;
    const normalizedAssigneeIds = this.normalizeAssigneeIds(assigneeIds);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        due_date: due_date ? new Date(due_date) : null,
        assignees: {
          deleteMany: {},
          create: normalizedAssigneeIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return this.mapTask(task);
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}

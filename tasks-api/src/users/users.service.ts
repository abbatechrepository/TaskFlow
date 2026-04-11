import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findSessionUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
      permissions: user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission)),
    };
  }

  async isAdmin(userId: number) {
    const total = await this.prisma.userRole.count({
      where: {
        user_id: userId,
        role: {
          name: 'Admin',
        },
      },
    });

    return total > 0;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        roles: {
          include: { role: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findSelect() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByUsernameOrEmail(login: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: login }, { email: login }],
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });
    return user;
  }

  async create(data: any) {
    const { roles, password, ...userData } = data;
    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password_hash,
      },
    });

    if (roles && roles.length > 0) {
      await this.prisma.userRole.createMany({
        data: roles.map((roleId: number) => ({
          user_id: user.id,
          role_id: roleId,
        })),
      });
    }

    return user;
  }

  async update(id: number, data: any) {
    const { roles, password, ...userData } = data;
    const updateData: any = { ...userData };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (roles) {
      await this.prisma.userRole.deleteMany({ where: { user_id: id } });

      if (roles.length > 0) {
        await this.prisma.userRole.createMany({
          data: roles.map((roleId: number) => ({
            user_id: id,
            role_id: roleId,
          })),
        });
      }
    }

    return { ok: true };
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }
}

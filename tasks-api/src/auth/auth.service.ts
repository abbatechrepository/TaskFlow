import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    console.log('Tentativa de login:', username);
    const user = await this.usersService.findByUsernameOrEmail(username);
    
    if (!user) {
      console.log('Usuário não encontrado no banco');
      return null;
    }

    console.log('Usuário encontrado:', user.username);
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    console.log('Senha confere?', isMatch);

    if (isMatch) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      roles: user.roles.map(r => r.role.name),
      permissions: user.roles.flatMap(r => r.role.permissions.map(p => p.permission))
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roles: payload.roles,
        permissions: payload.permissions
      }
    };
  }

  async recoverPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = Math.random().toString(36).substring(2, 15);
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { reset_token: token, reset_expires: expires },
      });
      
      // In a real app, send email here. For now just return token for demo.
      return { ok: true, msg: 'E-mail enviado! (Simulado)', token };
    }
    return { ok: true, msg: 'Se o e-mail existir, um link de recuperação foi enviado.' };
  }

  async resetPassword(token: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_expires: { gt: new Date() },
      },
    });

    if (user) {
      const password_hash = await bcrypt.hash(pass, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password_hash, reset_token: null, reset_expires: null },
      });
      return { ok: true };
    }
    throw new UnauthorizedException('Token inválido ou expirado');
  }
}

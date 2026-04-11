import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private async checkAdmin(req: any) {
    const isAdmin = await this.usersService.isAdmin(req.user?.userId);
    if (!isAdmin) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req) {
    return this.usersService.findSessionUser(req.user.userId);
  }

  // 🔥 LISTAR USUÁRIOS (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req) {
    await this.checkAdmin(req);
    return this.usersService.findAll();
  }

  // 🔥 LISTAR ROLES (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Get('roles')
  async findRoles(@Req() req) {
    await this.checkAdmin(req);
    return this.usersService.findRoles();
  }

  // 🔥 CRIAR USUÁRIO (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Req() req, @Body() createUserDto: any) {
    await this.checkAdmin(req);
    return this.usersService.create(createUserDto);
  }

  // 🔥 ATUALIZAR (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateUserDto: any) {
    await this.checkAdmin(req);
    return this.usersService.update(+id, updateUserDto);
  }

  // 🔥 DELETAR (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    await this.checkAdmin(req);
    return this.usersService.remove(+id);
  }

  // 🔥 LISTA SIMPLES PARA SELECT (qualquer usuário autenticado)
  @UseGuards(AuthGuard('jwt'))
  @Get('select')
  findSelect() {
    return this.usersService.findSelect();
  }
}

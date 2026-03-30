import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    const isAdmin = req.user?.roles?.includes('Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  // 🔥 LISTAR USUÁRIOS (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req) {
    this.checkAdmin(req);
    return this.usersService.findAll();
  }

  // 🔥 LISTAR ROLES (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Get('roles')
  findRoles(@Req() req) {
    this.checkAdmin(req);
    return this.usersService.findRoles();
  }

  // 🔥 CRIAR USUÁRIO (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req, @Body() createUserDto: any) {
    this.checkAdmin(req);
    return this.usersService.create(createUserDto);
  }

  // 🔥 ATUALIZAR (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() updateUserDto: any) {
    this.checkAdmin(req);
    return this.usersService.update(+id, updateUserDto);
  }

  // 🔥 DELETAR (só admin)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.usersService.remove(+id);
  }

  // 🔥 LISTA SIMPLES PARA SELECT (qualquer usuário autenticado)
  @UseGuards(AuthGuard('jwt'))
  @Get('select')
  findSelect() {
    return this.usersService.findSelect();
  }
}
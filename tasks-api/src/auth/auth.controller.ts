import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Post('recover')
  async recover(@Body() body: any) {
    return this.authService.recoverPassword(body.email);
  }

  @Post('reset')
  async reset(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.password);
  }
}

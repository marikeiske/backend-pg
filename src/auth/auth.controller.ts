import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rota para login
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;

    // Valida o usuário
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Retorna o token de autenticação
    return this.authService.login(user);
  }

  // Rota para registro de novos usuários
  @Post('register')
  async register(@Body() registerDto: { email: string; password: string }) {
    const { email, password } = registerDto;

    // Verifica se o e-mail e a senha foram fornecidos
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Registra o usuário
    const newUser = await this.authService.register(email, password);

    return {
      message: 'User registered successfully',
      userId: newUser.id,
    };
  }
}

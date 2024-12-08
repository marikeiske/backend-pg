import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // Método para validar um usuário por email e senha
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // Exclui a senha antes de retornar
      return result;
    }
    return null;
  }

  // Método para realizar o login
  async login(user: any) {
    const payload = { username: user.email, sub: user.id }; // Define as informações do payload
    return {
      access_token: this.jwtService.sign(payload), // Retorna o token gerado
    };
  }

  // Método para registrar um novo usuário
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10); // Gera o hash da senha
    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }

  // Método para buscar informações de um usuário com base no token JWT
  async getUserFromToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token); // Decodifica o token
      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid token: user not found');
      }
      const { password, ...result } = user; // Exclui a senha antes de retornar
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

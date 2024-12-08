import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Adicionado para registrar o controller
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configurando a estratégia padrão como JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey', // Use variável de ambiente para o segredo
      signOptions: { expiresIn: '1h' }, // Tempo de expiração do token
    }),
  ],
  controllers: [AuthController], // Registrando o AuthController
  providers: [
    AuthService,
    JwtStrategy, // Provedor para estratégia JWT
    PrismaService, // Provedor para interação com o banco via Prisma
  ],
  exports: [AuthService], // Exporta o AuthService para uso em outros módulos
})
export class AuthModule {}

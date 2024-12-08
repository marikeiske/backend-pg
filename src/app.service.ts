import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createUser() {
    const user = await this.prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'securepassword',
      },
    });
    return user;
  }
}

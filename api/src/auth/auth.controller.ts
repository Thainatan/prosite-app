import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() body: { email: string; password: string }) {
    try {
      let user = await prisma.user.findUnique({ where: { email: body.email } });

      // Auto-seed admin user on first login with demo credentials
      if (!user && body.email === 'admin@prosite.com') {
        const hash = await bcrypt.hash(body.password, 10);
        user = await prisma.user.create({
          data: {
            email: 'admin@prosite.com',
            passwordHash: hash,
            firstName: 'Admin',
            lastName: 'ProSite',
            role: 'ADMIN',
          },
        });
      }

      if (!user) return { error: 'Invalid credentials' };

      const valid = await bcrypt.compare(body.password, user.passwordHash);
      if (!valid) return { error: 'Invalid credentials' };

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

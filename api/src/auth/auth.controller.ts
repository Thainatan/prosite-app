import { Controller, Post, Get, Body, HttpCode, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() body: { email: string; password: string }) {
    try {
      let user = await prisma.user.findUnique({ where: { email: body.email } });

      // Auto-seed admin user on first login
      if (!user && body.email === 'admin@prosite.com') {
        // Create a default tenant for the seeded admin
        let tenant = await prisma.tenant.findFirst({ where: { slug: 'prosite-admin' } });
        if (!tenant) {
          tenant = await prisma.tenant.create({
            data: {
              name: 'ProSite Admin',
              slug: 'prosite-admin',
              plan: 'ENTERPRISE',
              status: 'ACTIVE',
            },
          });
        }
        const hash = await bcrypt.hash(body.password, 10);
        user = await prisma.user.create({
          data: {
            email: 'admin@prosite.com',
            passwordHash: hash,
            firstName: 'Admin',
            lastName: 'ProSite',
            role: 'ADMIN',
            tenantId: tenant.id,
          },
        });
      }

      if (!user) return { error: 'Invalid credentials' };

      const valid = await bcrypt.compare(body.password, user.passwordHash);
      if (!valid) return { error: 'Invalid credentials' };

      // Ensure legacy users get a tenant
      if (!user.tenantId) {
        let tenant = await prisma.tenant.findFirst({ where: { slug: 'prosite-admin' } });
        if (!tenant) {
          tenant = await prisma.tenant.create({
            data: { name: 'ProSite Admin', slug: 'prosite-admin', plan: 'ENTERPRISE', status: 'ACTIVE' },
          });
        }
        user = await prisma.user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
      }

      const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          plan: tenant?.plan ?? 'TRIAL',
          planExpiresAt: tenant?.planExpiresAt ?? null,
        },
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Public()
  @Post('register')
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body()
    body: {
      companyName: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      plan?: string;
      promoCode?: string;
    },
  ) {
    try {
      if (!body.companyName || !body.firstName || !body.lastName || !body.email || !body.password) {
        return { error: 'All fields are required' };
      }

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) return { error: 'Email already in use' };

      const baseSlug = body.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let slug = baseSlug;
      let suffix = 1;
      while (await prisma.tenant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix++}`;
      }

      let plan = 'TRIAL';
      let planExpiresAt: Date | null = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      // Pre-validate promo code before creating tenant
      let promoRecord: any = null;
      if (body.promoCode) {
        promoRecord = await prisma.promoCode.findUnique({
          where: { code: body.promoCode.trim().toUpperCase() },
        });
        if (promoRecord && promoRecord.isActive &&
            !(promoRecord.expiresAt && promoRecord.expiresAt < new Date()) &&
            !(promoRecord.maxUses > 0 && promoRecord.usedCount >= promoRecord.maxUses)) {
          if (promoRecord.type === 'FREE_FOREVER') {
            plan = 'FREE_FOREVER';
            planExpiresAt = null;
          } else if (promoRecord.type === 'TRIAL_EXTENSION') {
            plan = promoRecord.plan;
            planExpiresAt = new Date(Date.now() + promoRecord.trialDays * 24 * 60 * 60 * 1000);
          }
        } else {
          promoRecord = null; // invalid, ignore silently
        }
      }

      const tenant = await prisma.tenant.create({
        data: { name: body.companyName, slug, plan, planExpiresAt, status: 'ACTIVE' },
      });

      const passwordHash = await bcrypt.hash(body.password, 10);
      const user = await prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          firstName: body.firstName,
          lastName: body.lastName,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      // Create default CompanySettings for this tenant
      await prisma.companySettings.create({
        data: { tenantId: tenant.id, companyName: body.companyName },
      });

      // Record promo usage
      if (promoRecord) {
        await prisma.promoCodeUsage.create({
          data: { promoCodeId: promoRecord.id, tenantId: tenant.id },
        });
        await prisma.promoCode.update({
          where: { id: promoRecord.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: tenant.id,
          plan: tenant.plan,
          planExpiresAt: tenant.planExpiresAt,
        },
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Get('me')
  async me(@Req() req: any) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return { error: 'User not found' };

      const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });

      let daysLeftInTrial: number | null = null;
      if (tenant?.plan === 'TRIAL' && tenant.planExpiresAt) {
        daysLeftInTrial = Math.max(
          0,
          Math.ceil((tenant.planExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        );
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        plan: tenant?.plan ?? 'TRIAL',
        planExpiresAt: tenant?.planExpiresAt ?? null,
        daysLeftInTrial,
        tenantName: tenant?.name ?? '',
        tenantSlug: tenant?.slug ?? '',
        tenantStatus: tenant?.status ?? 'ACTIVE',
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

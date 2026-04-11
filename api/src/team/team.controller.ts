import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { prisma } from '../prisma';

const PLAN_USER_LIMITS: Record<string, number> = {
  TRIAL: 999,
  SOLO: 1,
  COMPANY: 5,
  ENTERPRISE: 20,
};

@Controller('team')
export class TeamController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = {};
      if (tenantId) where.tenantId = tenantId;
      return await prisma.teamMember.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';

      // Enforce plan user limits
      if (tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant) {
          const plan = tenant.plan;
          const limit = PLAN_USER_LIMITS[plan] ?? 999;
          const currentCount = await prisma.teamMember.count({
            where: { tenantId, status: { not: 'INACTIVE' } },
          });
          if (currentCount >= limit) {
            throw new HttpException(
              {
                error: `User limit reached for ${plan} plan (${limit} user${limit === 1 ? '' : 's'}). Upgrade your plan to add more team members.`,
                limitReached: true,
                plan,
                limit,
              },
              HttpStatus.PAYMENT_REQUIRED,
            );
          }
        }
      }

      return await prisma.teamMember.create({
        data: {
          tenantId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone || '',
          role: body.role || 'FIELD_TECH',
          status: body.status || 'ACTIVE',
        },
      });
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      return { error: e.message };
    }
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const member = await prisma.teamMember.findFirst({ where });
      if (!member) return { error: 'Not found' };

      return await prisma.teamMember.update({
        where: { id },
        data: {
          ...(body.firstName !== undefined && { firstName: body.firstName }),
          ...(body.lastName !== undefined && { lastName: body.lastName }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.role !== undefined && { role: body.role }),
          ...(body.status !== undefined && { status: body.status }),
        },
      });
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const member = await prisma.teamMember.findFirst({ where });
      if (!member) return { error: 'Not found' };
      await prisma.teamMember.update({ where: { id }, data: { status: 'INACTIVE' } });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

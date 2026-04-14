import { Controller, Post, Get, Body, Patch, Delete, Param, Req, HttpCode, ForbiddenException } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { PromoService } from './promo.service';
import { prisma } from '../prisma';

const isSuperAdmin = (user: any) =>
  user?.role === 'SUPER_ADMIN' || user?.email === (process.env.ADMIN_EMAIL || 'admin@prosite.com');

@Controller('promo')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Public()
  @Post('validate')
  @HttpCode(200)
  async validate(@Body() body: { code: string }) {
    if (!body.code) return { valid: false, message: 'Code is required' };
    return this.promoService.validateCode(body.code);
  }

  @Post('apply')
  @HttpCode(200)
  async apply(@Body() body: { code: string }, @Req() req: any) {
    if (!body.code) return { success: false, message: 'Code is required' };
    return this.promoService.applyCode(body.code, req.user.tenantId);
  }

  @Get()
  async list(@Req() req: any) {
    if (!isSuperAdmin(req.user)) throw new ForbiddenException('Access denied');
    return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: any, @Req() req: any) {
    if (!isSuperAdmin(req.user)) throw new ForbiddenException('Access denied');
    const { id, createdAt, updatedAt, usedCount, ...rest } = body;
    return prisma.promoCode.create({
      data: { ...rest, code: (rest.code || '').trim().toUpperCase() },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!isSuperAdmin(req.user)) throw new ForbiddenException('Access denied');
    const { id: _id, createdAt, updatedAt, usedCount, ...rest } = body;
    if (rest.code) rest.code = rest.code.trim().toUpperCase();
    return prisma.promoCode.update({ where: { id }, data: rest });
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string, @Req() req: any) {
    if (!isSuperAdmin(req.user)) throw new ForbiddenException('Access denied');
    await prisma.promoCodeUsage.deleteMany({ where: { promoCodeId: id } });
    await prisma.promoCode.delete({ where: { id } });
    return { success: true };
  }

  @Get(':id/usage')
  async usage(@Param('id') id: string, @Req() req: any) {
    if (!isSuperAdmin(req.user)) throw new ForbiddenException('Access denied');
    return prisma.promoCodeUsage.findMany({
      where: { promoCodeId: id },
      orderBy: { usedAt: 'desc' },
    });
  }
}

import { Controller, Get, Patch, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { prisma } from '../prisma';

const isSuperAdmin = (req: any) =>
  req.user?.role === 'SUPER_ADMIN' ||
  req.user?.email === (process.env.ADMIN_EMAIL || 'admin@prosite.com');

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('overview')
  async overview(@Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    return this.adminService.getOverview();
  }

  @Get('tenants')
  async tenants(@Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    return this.adminService.getTenants();
  }

  @Get('tenants/:id')
  async tenantById(@Param('id') id: string, @Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    const result = await this.adminService.getTenantById(id);
    if (!result) return { error: 'Tenant not found' };
    return result;
  }

  @Patch('tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @Body() body: { plan?: string; status?: string; planExpiresAt?: string | null },
    @Req() req: any,
  ) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    try {
      return await this.adminService.updateTenant(id, body);
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Get('reports')
  async reports(@Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    return this.adminService.getReports();
  }

  // Promo Code management (super admin version with full tenant info)
  @Get('promo')
  async listPromo(@Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    return codes;
  }

  @Post('promo')
  async createPromo(@Body() body: any, @Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    const { id, createdAt, updatedAt, usedCount, ...rest } = body;
    return prisma.promoCode.create({
      data: { ...rest, code: (rest.code || '').trim().toUpperCase() },
    });
  }

  @Patch('promo/:id')
  async updatePromo(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    const { id: _id, createdAt, updatedAt, usedCount, ...rest } = body;
    if (rest.code) rest.code = rest.code.trim().toUpperCase();
    return prisma.promoCode.update({ where: { id }, data: rest });
  }

  @Delete('promo/:id')
  async deletePromo(@Param('id') id: string, @Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    await prisma.promoCodeUsage.deleteMany({ where: { promoCodeId: id } });
    await prisma.promoCode.delete({ where: { id } });
    return { success: true };
  }

  @Get('promo/:id/usage')
  async promoUsage(@Param('id') id: string, @Req() req: any) {
    if (!isSuperAdmin(req)) return { error: 'Forbidden' };
    const usages = await prisma.promoCodeUsage.findMany({
      where: { promoCodeId: id },
      orderBy: { usedAt: 'desc' },
    });
    // Enrich with tenant info
    const enriched = await Promise.all(
      usages.map(async (u) => {
        const tenant = await prisma.tenant.findUnique({ where: { id: u.tenantId }, select: { name: true, plan: true, status: true } });
        return { ...u, tenantName: tenant?.name ?? 'Unknown', plan: tenant?.plan ?? '', status: tenant?.status ?? '' };
      }),
    );
    return enriched;
  }
}

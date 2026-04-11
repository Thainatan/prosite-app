import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('settings')
export class SettingsController {
  @Get()
  async get(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = tenantId ? { tenantId } : {};
      const s = await prisma.companySettings.findFirst({ where });
      return s || {};
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async upsert(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = tenantId ? { tenantId } : {};
      const existing = await prisma.companySettings.findFirst({ where });
      const data: any = {
        tenantId,
        companyName:      body.companyName      ?? '',
        phone:            body.phone            ?? '',
        email:            body.email            ?? '',
        address:          body.address          ?? '',
        city:             body.city             ?? '',
        state:            body.state            ?? 'FL',
        zip:              body.zip              ?? '',
        website:          body.website          ?? '',
        logoBase64:       body.logoBase64       ?? null,
        brandColor:       body.brandColor       ?? '#4F7EF7',
        headerLayout:     body.headerLayout     ?? 'Classic',
        showQty:          body.showQty          ?? true,
        showUnitPrice:    body.showUnitPrice     ?? true,
        showLineTotal:    body.showLineTotal    ?? true,
        footerDisclaimer: body.footerDisclaimer ?? '',
        useEstimate:      body.useEstimate      ?? false,
        emailNewQuote:    body.emailNewQuote    ?? true,
        emailApproved:    body.emailApproved    ?? true,
        emailPayment:     body.emailPayment     ?? true,
        emailOverdue:     body.emailOverdue     ?? true,
      };
      if (existing) {
        return await prisma.companySettings.update({ where: { id: existing.id }, data });
      }
      return await prisma.companySettings.create({ data });
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

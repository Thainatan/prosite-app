import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('clients')
export class ClientsController {
  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const base: any = tenantId ? { tenantId } : {};
      const where = search
        ? {
            ...base,
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : base;
      return await prisma.client.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (error: any) {
      return { error: error.message };
    }
  }

  @Get(':id/quotes')
  async clientQuotes(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { clientId: id };
      if (tenantId) where.tenantId = tenantId;
      return await prisma.estimate.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (error: any) { return { error: error.message }; }
  }

  @Get(':id/projects')
  async clientProjects(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { clientId: id };
      if (tenantId) where.tenantId = tenantId;
      return await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (error: any) { return { error: error.message }; }
  }

  @Get(':id/invoices')
  async clientInvoices(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { clientId: id };
      if (tenantId) where.tenantId = tenantId;
      return await prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (error: any) { return { error: error.message }; }
  }

  @Get(':id/tasks')
  async clientTasks(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = {};
      if (tenantId) where.tenantId = tenantId;
      const events = await prisma.scheduleEvent.findMany({ where, orderBy: { startDateTime: 'desc' } });
      return events.filter(e => {
        try { const n = JSON.parse(e.notes || '{}'); return n.clientId === id; } catch { return false; }
      });
    } catch (error: any) { return { error: error.message }; }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      return await prisma.client.create({
        data: {
          tenantId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email || null,
          phone: body.phone,
          address: body.address || '',
          city: body.city || '',
          state: body.state || 'FL',
          zip: body.zip || '',
          notes: body.notes || null,
        },
      });
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

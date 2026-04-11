import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

@Controller('clients')
export class ClientsController {
  @Get()
  async findAll(@Query('search') search?: string) {
    try {
      const where = search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {};
      const clients = await prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return clients;
    } catch (error) {
      console.error('CLIENTS ERROR:', error.message);
      return { error: error.message };
    }
  }

  @Get(':id/quotes')
  async clientQuotes(@Param('id') id: string) {
    try {
      return await prisma.estimate.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' } });
    } catch (error) { return { error: error.message }; }
  }

  @Get(':id/projects')
  async clientProjects(@Param('id') id: string) {
    try {
      return await prisma.project.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' } });
    } catch (error) { return { error: error.message }; }
  }

  @Get(':id/invoices')
  async clientInvoices(@Param('id') id: string) {
    try {
      return await prisma.invoice.findMany({ where: { clientId: id }, orderBy: { createdAt: 'desc' } });
    } catch (error) { return { error: error.message }; }
  }

  @Get(':id/tasks')
  async clientTasks(@Param('id') id: string) {
    try {
      // Tasks store clientId in notes JSON; filter in-memory
      const events = await prisma.scheduleEvent.findMany({ orderBy: { startDateTime: 'desc' } });
      return events.filter(e => {
        try { const n = JSON.parse(e.notes || '{}'); return n.clientId === id; } catch { return false; }
      });
    } catch (error) { return { error: error.message }; }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await prisma.client.create({
        data: {
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
    } catch (error) {
      console.error('CREATE CLIENT ERROR:', error.message);
      return { error: error.message };
    }
  }
}
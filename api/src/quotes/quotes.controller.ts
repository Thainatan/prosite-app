import { Controller, Get, Post, Body } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('quotes')
export class QuotesController {
  @Get()
  async findAll() {
    try {
      return await prisma.estimate.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await prisma.estimate.create({
        data: {
          estimateNumber: 'PS-Q-' + Date.now(),
          clientId: body.clientId || null,
          serviceType: body.serviceType || 'OTHER',
          status: 'DRAFT',
          title: body.title || 'New Quote',
          subtotal: body.subtotal || 0,
          total: body.total || 0,
          createdById: body.createdById || 'system',
        },
      });
    } catch (e: any) {
      return { error: e.message };
    }
  }
}
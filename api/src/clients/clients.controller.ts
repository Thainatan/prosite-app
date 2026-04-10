import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

@Controller('clients')
export class ClientsController {
  @Get()
  async findAll() {
    try {
      const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return clients;
    } catch (error) {
      console.error('CLIENTS ERROR:', error.message);
      return { error: error.message };
    }
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
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('team')
export class TeamController {
  @Get()
  async findAll() {
    try {
      return await prisma.teamMember.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await prisma.teamMember.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone || '',
          role: body.role || 'FIELD_TECH',
          status: body.status || 'ACTIVE',
        },
      });
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
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
  async remove(@Param('id') id: string) {
    try {
      await prisma.teamMember.update({ where: { id }, data: { status: 'INACTIVE' } });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

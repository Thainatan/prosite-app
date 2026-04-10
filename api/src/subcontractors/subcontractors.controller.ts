import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('subcontractors')
export class SubcontractorsController {
  @Get()
  async findAll() {
    try {
      return await prisma.subcontractor.findMany({
        where: { status: { not: 'DELETED' } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e: any) { return { error: e.message }; }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await prisma.subcontractor.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          company: body.company || '',
          trade: body.trade,
          phone: body.phone,
          email: body.email || '',
          address: body.address || '',
          city: body.city || '',
          state: body.state || 'FL',
          zip: body.zip || '',
          licenseNumber: body.licenseNumber || '',
          insuranceExp: body.insuranceExp ? new Date(body.insuranceExp) : null,
          rating: body.rating ?? 5,
          notes: body.notes || '',
          status: body.status || 'ACTIVE',
        },
      });
    } catch (e: any) { return { error: e.message }; }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      const data: any = {};
      if (body.firstName !== undefined) data.firstName = body.firstName;
      if (body.lastName !== undefined) data.lastName = body.lastName;
      if (body.company !== undefined) data.company = body.company;
      if (body.trade !== undefined) data.trade = body.trade;
      if (body.phone !== undefined) data.phone = body.phone;
      if (body.email !== undefined) data.email = body.email;
      if (body.address !== undefined) data.address = body.address;
      if (body.city !== undefined) data.city = body.city;
      if (body.state !== undefined) data.state = body.state;
      if (body.zip !== undefined) data.zip = body.zip;
      if (body.licenseNumber !== undefined) data.licenseNumber = body.licenseNumber;
      if (body.insuranceExp !== undefined) data.insuranceExp = body.insuranceExp ? new Date(body.insuranceExp) : null;
      if (body.rating !== undefined) data.rating = body.rating;
      if (body.notes !== undefined) data.notes = body.notes;
      if (body.status !== undefined) data.status = body.status;
      return await prisma.subcontractor.update({ where: { id }, data });
    } catch (e: any) { return { error: e.message }; }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await prisma.subcontractor.delete({ where: { id } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}

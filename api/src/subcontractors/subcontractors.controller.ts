import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('subcontractors')
export class SubcontractorsController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { status: { not: 'DELETED' } };
      if (tenantId) where.tenantId = tenantId;
      return await prisma.subcontractor.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (e: any) { return { error: e.message }; }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      return await prisma.subcontractor.create({
        data: {
          tenantId,
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
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const sub = await prisma.subcontractor.findFirst({ where });
      if (!sub) return { error: 'Not found' };

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
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const sub = await prisma.subcontractor.findFirst({ where });
      if (!sub) return { error: 'Not found' };
      await prisma.subcontractor.delete({ where: { id } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}

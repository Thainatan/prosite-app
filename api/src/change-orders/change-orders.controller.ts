import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('change-orders')
export class ChangeOrdersController {
  @Get()
  async findAll() {
    try {
      const orders = await prisma.changeOrder.findMany({ orderBy: { createdAt: 'desc' } });
      const projectIds = [...new Set(orders.map(o => o.projectId).filter(Boolean))] as string[];
      const projects = projectIds.length
        ? await prisma.project.findMany({ where: { id: { in: projectIds } } })
        : [];
      const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
      return orders.map(o => ({
        ...o,
        totalCost: Number(o.totalCost),
        laborCost: Number(o.laborCost),
        materialCost: Number(o.materialCost),
        project: o.projectId ? projectMap[o.projectId] || null : null,
      }));
    } catch (e: any) { return { error: e.message }; }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      const order = await prisma.changeOrder.create({
        data: {
          changeOrderNumber: 'CO-' + Date.now(),
          projectId: body.projectId || '',
          clientId: body.clientId || 'system',
          title: body.title || '',
          description: body.description || '',
          status: body.status || 'PENDING',
          totalCost: body.amount || 0,
          laborCost: 0,
          materialCost: 0,
          createdById: 'system',
        },
      });
      return { ...order, totalCost: Number(order.totalCost) };
    } catch (e: any) { return { error: e.message }; }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      const data: any = {};
      if (body.status !== undefined) data.status = body.status;
      if (body.title !== undefined) data.title = body.title;
      if (body.description !== undefined) data.description = body.description;
      if (body.amount !== undefined) data.totalCost = body.amount;
      const updated = await prisma.changeOrder.update({ where: { id }, data });
      return { ...updated, totalCost: Number(updated.totalCost) };
    } catch (e: any) { return { error: e.message }; }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await prisma.changeOrder.delete({ where: { id } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}

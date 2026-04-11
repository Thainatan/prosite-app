import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('change-orders')
export class ChangeOrdersController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = {};
      if (tenantId) where.tenantId = tenantId;

      const orders = await prisma.changeOrder.findMany({ where, orderBy: { createdAt: 'desc' } });
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
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const order = await prisma.changeOrder.create({
        data: {
          tenantId,
          changeOrderNumber: 'CO-' + Date.now(),
          projectId: body.projectId || '',
          clientId: body.clientId || 'system',
          title: body.title || '',
          description: body.description || '',
          status: body.status || 'PENDING',
          totalCost: body.amount || 0,
          laborCost: 0,
          materialCost: 0,
          createdById: req.user?.id || 'system',
        },
      });
      return { ...order, totalCost: Number(order.totalCost) };
    } catch (e: any) { return { error: e.message }; }
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const co = await prisma.changeOrder.findFirst({ where });
      if (!co) return { error: 'Not found' };

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
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const co = await prisma.changeOrder.findFirst({ where });
      if (!co) return { error: 'Not found' };
      await prisma.changeOrder.delete({ where: { id } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}

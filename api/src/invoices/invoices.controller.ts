import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('invoices')
export class InvoicesController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { status: { not: 'ARCHIVED' } };
      if (tenantId) where.tenantId = tenantId;

      const invoices = await prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' } });

      const projectIds = [...new Set(invoices.map(i => i.projectId).filter(Boolean))] as string[];
      const clientIds = [...new Set(invoices.map(i => i.clientId).filter(Boolean))] as string[];

      const [projects, clients] = await Promise.all([
        projectIds.length ? prisma.project.findMany({ where: { id: { in: projectIds } } }) : [],
        clientIds.length ? prisma.client.findMany({ where: { id: { in: clientIds } } }) : [],
      ]);

      const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
      const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

      return invoices.map(inv => ({
        ...inv,
        total: Number(inv.total),
        subtotal: Number(inv.subtotal),
        amountPaid: Number(inv.amountPaid),
        amountDue: Number(inv.amountDue),
        project: inv.projectId && inv.projectId !== 'DIRECT' ? projectMap[inv.projectId] || null : null,
        client: inv.clientId ? clientMap[inv.clientId] || null : null,
      }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const invoice = await prisma.invoice.create({
        data: {
          tenantId,
          invoiceNumber: 'PS-INV-' + Date.now(),
          projectId: body.projectId || 'DIRECT',
          clientId: body.clientId,
          type: body.type || 'deposit',
          status: 'DRAFT',
          lineItems: body.lineItems || [],
          subtotal: body.subtotal || 0,
          total: body.total || 0,
          amountPaid: 0,
          amountDue: body.total || 0,
          createdById: req.user?.id || 'system',
        },
      });
      return {
        ...invoice,
        total: Number(invoice.total),
        subtotal: Number(invoice.subtotal),
        amountPaid: Number(invoice.amountPaid),
        amountDue: Number(invoice.amountDue),
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id/pay')
  async recordPayment(@Req() req: any, @Param('id') id: string, @Body() body: { amount: number; notes?: string }) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const invoice = await prisma.invoice.findFirst({ where });
      if (!invoice) return { error: 'Invoice not found' };

      const newPaid = Number(invoice.amountPaid) + Number(body.amount);
      const newDue = Math.max(0, Number(invoice.total) - newPaid);
      const newStatus = newDue <= 0 ? 'PAID' : 'PARTIAL';

      const updated = await prisma.invoice.update({
        where: { id },
        data: { amountPaid: newPaid, amountDue: newDue, status: newStatus },
      });
      return {
        ...updated,
        total: Number(updated.total),
        subtotal: Number(updated.subtotal),
        amountPaid: Number(updated.amountPaid),
        amountDue: Number(updated.amountDue),
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id/archive')
  async archive(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const inv = await prisma.invoice.findFirst({ where });
      if (!inv) return { error: 'Not found' };
      const updated = await prisma.invoice.update({ where: { id }, data: { status: 'ARCHIVED' } });
      return { ...updated, total: Number(updated.total), amountPaid: Number(updated.amountPaid), amountDue: Number(updated.amountDue) };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const inv = await prisma.invoice.findFirst({ where });
      if (!inv) return { error: 'Not found' };
      await prisma.invoice.delete({ where: { id } });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

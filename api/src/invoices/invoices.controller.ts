import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('invoices')
export class InvoicesController {
  @Get()
  async findAll() {
    try {
      const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });

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
        project: inv.projectId ? projectMap[inv.projectId] || null : null,
        client: inv.clientId ? clientMap[inv.clientId] || null : null,
      }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: 'PS-INV-' + Date.now(),
          projectId: body.projectId,
          clientId: body.clientId,
          type: body.type || 'deposit',
          status: 'DRAFT',
          lineItems: body.lineItems || [],
          subtotal: body.subtotal || 0,
          total: body.total || 0,
          amountPaid: 0,
          amountDue: body.total || 0,
          createdById: body.createdById || 'system',
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
  async recordPayment(@Param('id') id: string, @Body() body: { amount: number; notes?: string }) {
    try {
      const invoice = await prisma.invoice.findUnique({ where: { id } });
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
}

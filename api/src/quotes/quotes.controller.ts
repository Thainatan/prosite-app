import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('quotes')
export class QuotesController {
  @Get()
  async findAll() {
    try {
      const estimates = await prisma.estimate.findMany({ orderBy: { createdAt: 'desc' } });
      const clientIds = [...new Set(estimates.map(e => e.clientId).filter(Boolean))] as string[];
      const clients = clientIds.length
        ? await prisma.client.findMany({ where: { id: { in: clientIds } } })
        : [];
      const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
      return estimates.map(e => ({
        ...e,
        total: Number(e.total),
        subtotal: Number(e.subtotal),
        client: e.clientId ? clientMap[e.clientId] || null : null,
      }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      const estimate = await prisma.estimate.create({
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
      return { ...estimate, total: Number(estimate.total), subtotal: Number(estimate.subtotal) };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    try {
      const quote = await prisma.estimate.findUnique({ where: { id } });
      if (!quote) return { error: 'Quote not found' };
      if (quote.status === 'APPROVED') return { error: 'Quote already approved' };

      const total = Number(quote.total);

      // Create project from quote
      const project = await prisma.project.create({
        data: {
          jobNumber: 'PS-' + Date.now(),
          name: quote.title,
          clientId: quote.clientId!,
          serviceType: quote.serviceType,
          status: 'IN_PROGRESS',
          address: '',
          city: '',
          state: 'FL',
          zip: '',
          estimatedValue: total,
          notes: `Created from Quote ${quote.estimateNumber}`,
        },
      });

      // Create deposit invoice (30% of total)
      const depositAmount = Math.round(total * 0.3 * 100) / 100;
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: 'PS-INV-' + Date.now(),
          projectId: project.id,
          clientId: quote.clientId!,
          type: 'deposit',
          status: 'DRAFT',
          lineItems: [{ description: `Deposit — 30% of contract (${quote.title})`, amount: depositAmount }],
          subtotal: depositAmount,
          total: depositAmount,
          amountPaid: 0,
          amountDue: depositAmount,
          createdById: quote.createdById,
        },
      });

      // Update quote status and link to project
      const updatedQuote = await prisma.estimate.update({
        where: { id },
        data: { status: 'APPROVED', projectId: project.id },
      });

      return {
        quote: { ...updatedQuote, total: Number(updatedQuote.total), subtotal: Number(updatedQuote.subtotal) },
        project: { ...project, estimatedValue: Number(project.estimatedValue) },
        invoice: { ...invoice, total: Number(invoice.total), subtotal: Number(invoice.subtotal), amountDue: Number(invoice.amountDue) },
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

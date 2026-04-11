import { Controller, Get, Post, Patch, Delete, Body, Param, HttpException, HttpStatus, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('quotes')
export class QuotesController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { status: { not: 'ARCHIVED' } };
      if (tenantId) where.tenantId = tenantId;

      const estimates = await prisma.estimate.findMany({ where, orderBy: { createdAt: 'desc' } });
      const clientIds = [...new Set(estimates.map(e => e.clientId).filter(Boolean))] as string[];
      const clients = clientIds.length
        ? await prisma.client.findMany({ where: { id: { in: clientIds } } })
        : [];
      const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
      return estimates.map(e => ({
        ...e,
        total: Number(e.total),
        subtotal: Number(e.subtotal),
        lineItems: e.lineItems || [],
        client: e.clientId ? clientMap[e.clientId] || null : null,
      }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const estimate = await prisma.estimate.create({
        data: {
          tenantId,
          estimateNumber: 'PS-Q-' + Date.now(),
          clientId: body.clientId || null,
          serviceType: body.serviceType || 'OTHER',
          status: 'DRAFT',
          title: body.title || 'New Quote',
          subtotal: body.subtotal || 0,
          total: body.total || 0,
          lineItems: body.items || [],
          createdById: req.user?.id || 'system',
        },
      });
      return { ...estimate, total: Number(estimate.total), subtotal: Number(estimate.subtotal), lineItems: estimate.lineItems || [] };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id/approve')
  async approve(@Req() req: any, @Param('id') id: string) {
    const tenantId: string = req.user?.tenantId ?? '';
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;

    const quote = await prisma.estimate.findFirst({ where });
    if (!quote) return { error: 'Quote not found' };
    if (quote.status === 'APPROVED') return { error: 'Quote already approved' };

    if (!quote.clientId) {
      throw new HttpException(
        { error: 'Please assign a client to this quote before approving.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const total = Number(quote.total);

      const project = await prisma.project.create({
        data: {
          tenantId,
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

      const depositAmount = Math.round(total * 0.3 * 100) / 100;
      const invoice = await prisma.invoice.create({
        data: {
          tenantId,
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
          createdById: req.user?.id || 'system',
        },
      });

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

  @Patch(':id/archive')
  async archive(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = { id };
      if (tenantId) where.tenantId = tenantId;
      const quote = await prisma.estimate.findFirst({ where });
      if (!quote) return { error: 'Not found' };
      const updated = await prisma.estimate.update({ where: { id }, data: { status: 'ARCHIVED' } });
      return { ...updated, total: Number(updated.total), subtotal: Number(updated.subtotal) };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post(':id/duplicate')
  async duplicate(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const q = await prisma.estimate.findUnique({ where: { id } });
      if (!q) return { error: 'Not found' };
      const copy = await prisma.estimate.create({
        data: {
          tenantId,
          estimateNumber: 'PS-Q-' + Date.now(),
          clientId: q.clientId,
          serviceType: q.serviceType,
          status: 'DRAFT',
          title: q.title + ' (Copy)',
          subtotal: q.subtotal,
          total: q.total,
          lineItems: (q.lineItems as any) || [],
          createdById: req.user?.id || 'system',
        },
      });
      return { ...copy, total: Number(copy.total), subtotal: Number(copy.subtotal), lineItems: copy.lineItems || [] };
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
      const quote = await prisma.estimate.findFirst({ where });
      if (!quote) return { error: 'Not found' };
      await prisma.estimate.delete({ where: { id } });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

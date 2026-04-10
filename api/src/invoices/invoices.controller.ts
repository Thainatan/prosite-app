import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
@Controller('invoices')
export class InvoicesController {
  @Get() async findAll() { try { return await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } }); } catch(e: any) { return { error: e.message }; } }
  @Post() async create(@Body() body: any) { try { return await prisma.invoice.create({ data: { invoiceNumber: 'PS-INV-' + Date.now(), projectId: body.projectId, clientId: body.clientId, type: body.type || 'deposit', status: 'DRAFT', lineItems: body.lineItems || [], subtotal: body.subtotal || 0, total: body.total || 0, amountPaid: 0, amountDue: body.total || 0, createdById: body.createdById || 'system' } }); } catch(e: any) { return { error: e.message }; } }
}

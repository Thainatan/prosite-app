import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
@Controller('projects')
export class ProjectsController {
  @Get() async findAll() { try { return await prisma.project.findMany({ orderBy: { createdAt: 'desc' } }); } catch(e: any) { return { error: e.message }; } }
  @Post() async create(@Body() body: any) { try { return await prisma.project.create({ data: { jobNumber: 'PS-' + Date.now(), name: body.name, clientId: body.clientId, serviceType: body.serviceType || 'OTHER', status: 'APPROVED', address: body.address || '', city: body.city || '', state: body.state || 'FL', zip: body.zip || '' } }); } catch(e: any) { return { error: e.message }; } }
}

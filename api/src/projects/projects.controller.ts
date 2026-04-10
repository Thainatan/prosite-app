import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('projects')
export class ProjectsController {
  @Get()
  async findAll() {
    try {
      const projects = await prisma.project.findMany({
        where: { status: { not: 'ARCHIVED' } },
        orderBy: { createdAt: 'desc' },
      });
      const clientIds = [...new Set(projects.map(p => p.clientId).filter(Boolean))] as string[];
      const clients = clientIds.length
        ? await prisma.client.findMany({ where: { id: { in: clientIds } } })
        : [];
      const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
      return projects.map(p => ({
        ...p,
        estimatedValue: p.estimatedValue ? Number(p.estimatedValue) : null,
        client: clientMap[p.clientId] || null,
      }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      const project = await prisma.project.create({
        data: {
          jobNumber: 'PS-' + Date.now(),
          name: body.name,
          clientId: body.clientId,
          serviceType: body.serviceType || 'OTHER',
          status: 'APPROVED',
          address: body.address || '',
          city: body.city || '',
          state: body.state || 'FL',
          zip: body.zip || '',
          estimatedValue: body.estimatedValue || null,
        },
      });
      return { ...project, estimatedValue: project.estimatedValue ? Number(project.estimatedValue) : null };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    try {
      const updated = await prisma.project.update({ where: { id }, data: { status: 'ARCHIVED' } });
      return { ...updated, estimatedValue: updated.estimatedValue ? Number(updated.estimatedValue) : null };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await prisma.project.delete({ where: { id } });
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

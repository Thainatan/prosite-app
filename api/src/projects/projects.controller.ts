import { Controller, Get, Post, Body } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('projects')
export class ProjectsController {
  @Get()
  async findAll() {
    try {
      const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
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
}

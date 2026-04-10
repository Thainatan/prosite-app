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

      const projectIds = projects.map(p => p.id);
      const subCounts = projectIds.length
        ? await prisma.projectSubcontractor.groupBy({
            by: ['projectId'],
            _count: { id: true },
            where: { projectId: { in: projectIds } },
          })
        : [];
      const subCountMap = Object.fromEntries(subCounts.map(s => [s.projectId, s._count.id]));

      return projects.map(p => ({
        ...p,
        estimatedValue: p.estimatedValue ? Number(p.estimatedValue) : null,
        client: clientMap[p.clientId] || null,
        subcontractorCount: subCountMap[p.id] || 0,
      }));
    } catch (e: any) { return { error: e.message }; }
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
    } catch (e: any) { return { error: e.message }; }
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    try {
      const updated = await prisma.project.update({ where: { id }, data: { status: 'ARCHIVED' } });
      return { ...updated, estimatedValue: updated.estimatedValue ? Number(updated.estimatedValue) : null };
    } catch (e: any) { return { error: e.message }; }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await prisma.project.delete({ where: { id } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }

  // ── Subcontractor assignment ──────────────────────────────────────

  @Get(':id/subcontractors')
  async getSubcontractors(@Param('id') id: string) {
    try {
      const assignments = await prisma.projectSubcontractor.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
      });
      const subIds = assignments.map(a => a.subcontractorId);
      const subs = subIds.length
        ? await prisma.subcontractor.findMany({ where: { id: { in: subIds } } })
        : [];
      const subMap = Object.fromEntries(subs.map(s => [s.id, s]));
      return assignments.map(a => ({
        ...a,
        subcontractor: subMap[a.subcontractorId] || null,
      }));
    } catch (e: any) { return { error: e.message }; }
  }

  @Post(':id/subcontractors')
  async assignSubcontractor(@Param('id') id: string, @Body() body: any) {
    try {
      return await prisma.projectSubcontractor.create({
        data: {
          projectId: id,
          subcontractorId: body.subcontractorId,
          trade: body.trade || '',
          scope: body.scope || '',
          startDate: body.startDate ? new Date(body.startDate) : null,
          status: body.status || 'SCHEDULED',
          notes: body.notes || '',
        },
      });
    } catch (e: any) { return { error: e.message }; }
  }

  @Patch(':id/subcontractors/:subId')
  async updateAssignment(@Param('id') id: string, @Param('subId') subId: string, @Body() body: any) {
    try {
      const data: any = {};
      if (body.status !== undefined) data.status = body.status;
      if (body.scope !== undefined) data.scope = body.scope;
      if (body.notes !== undefined) data.notes = body.notes;
      return await prisma.projectSubcontractor.update({
        where: { id: subId },
        data,
      });
    } catch (e: any) { return { error: e.message }; }
  }

  @Delete(':id/subcontractors/:subId')
  async removeSubcontractor(@Param('id') id: string, @Param('subId') subId: string) {
    try {
      await prisma.projectSubcontractor.delete({ where: { id: subId } });
      return { success: true };
    } catch (e: any) { return { error: e.message }; }
  }
}

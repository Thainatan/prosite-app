import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('tasks')
export class TasksController {
  @Get()
  async findAll(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const where: any = {};
      if (tenantId) where.tenantId = tenantId;

      const events = await prisma.scheduleEvent.findMany({ where, orderBy: { startDateTime: 'asc' } });

      const parsed = events.map(e => {
        let clientId: string | null = null;
        let clientName = '';
        let note = e.notes || '';
        try {
          if (e.notes?.startsWith('{')) {
            const obj = JSON.parse(e.notes);
            clientId = obj.clientId || null;
            clientName = obj.clientName || '';
            note = obj.note || '';
          }
        } catch {}
        return { ...e, clientId, clientName, notes: note };
      });

      const clientIds = [...new Set(parsed.map(e => e.clientId).filter(Boolean))] as string[];
      const clients = clientIds.length
        ? await prisma.client.findMany({ where: { id: { in: clientIds } } })
        : [];
      const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

      return parsed.map(e => ({ ...e, client: e.clientId ? clientMap[e.clientId] || null : null }));
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const notesJson = JSON.stringify({
        clientId: body.clientId || null,
        clientName: body.clientName || '',
        note: body.notes || '',
      });

      const event = await prisma.scheduleEvent.create({
        data: {
          tenantId,
          title: body.title,
          type: body.type || 'Other',
          address: body.address || '',
          startDateTime: new Date(body.startDateTime),
          endDateTime: new Date(body.endDateTime),
          assignedUserId: req.user?.id || 'system',
          projectId: null,
          notes: notesJson,
        },
      });

      return {
        ...event,
        clientId: body.clientId || null,
        clientName: body.clientName || '',
        notes: body.notes || '',
        client: null,
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }
}

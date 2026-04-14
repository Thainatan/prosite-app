import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class AdminService {
  async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      tenants,
      totalClients,
      totalQuotes,
      totalProjects,
      totalInvoices,
      paidInvoices,
      newThisMonth,
      newLastMonth,
    ] = await Promise.all([
      prisma.tenant.findMany({ select: { id: true, plan: true, status: true, createdAt: true } }),
      prisma.client.count(),
      prisma.estimate.count(),
      prisma.project.count(),
      prisma.invoice.count(),
      prisma.invoice.findMany({ where: { status: 'PAID' }, select: { total: true } }),
      prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.tenant.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    // Active tenants: has any record updated in last 30 days
    const recentClients = await prisma.client.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { tenantId: true },
      distinct: ['tenantId'],
    });
    const activeTenantIds = new Set(recentClients.map(c => c.tenantId));

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const trialTenants = tenants.filter(t => t.plan === 'TRIAL').length;
    const paidTenants = tenants.filter(t => !['TRIAL', 'FREE_FOREVER'].includes(t.plan)).length;
    const growthRate = newLastMonth > 0 ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : 0;

    return {
      totalTenants: tenants.length,
      activeTenants: activeTenantIds.size,
      trialTenants,
      paidTenants,
      totalRevenue,
      totalClients,
      totalQuotes,
      totalProjects,
      totalInvoices,
      newTenantsThisMonth: newThisMonth,
      newTenantsLastMonth: newLastMonth,
      growthRate,
    };
  }

  async getTenants() {
    const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });

    const result = await Promise.all(
      tenants.map(async (tenant) => {
        const [
          clientsCount,
          quotesCount,
          projectsCount,
          invoicesCount,
          paidInvoices,
          unpaidInvoices,
          teamCount,
          lastClient,
          lastProject,
          lastInvoice,
        ] = await Promise.all([
          prisma.client.count({ where: { tenantId: tenant.id } }),
          prisma.estimate.count({ where: { tenantId: tenant.id } }),
          prisma.project.count({ where: { tenantId: tenant.id } }),
          prisma.invoice.count({ where: { tenantId: tenant.id } }),
          prisma.invoice.findMany({ where: { tenantId: tenant.id, status: 'PAID' }, select: { total: true } }),
          prisma.invoice.findMany({ where: { tenantId: tenant.id, status: { not: 'PAID' } }, select: { total: true } }),
          prisma.teamMember.count({ where: { tenantId: tenant.id } }),
          prisma.client.findFirst({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
          prisma.project.findFirst({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
          prisma.invoice.findFirst({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
        ]);

        const dates = [lastClient?.createdAt, lastProject?.createdAt, lastInvoice?.createdAt].filter(Boolean) as Date[];
        const lastActivity = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

        return {
          ...tenant,
          stats: {
            clientsCount,
            quotesCount,
            projectsCount,
            invoicesCount,
            invoicesPaidTotal: paidInvoices.reduce((s, i) => s + Number(i.total), 0),
            invoicesUnpaidTotal: unpaidInvoices.reduce((s, i) => s + Number(i.total), 0),
            teamCount,
            lastActivity,
          },
        };
      }),
    );

    return result;
  }

  async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return null;

    const [
      clientsCount,
      quotesCount,
      projectsActive,
      projectsCompleted,
      invoicesTotal,
      paidInvoices,
      unpaidInvoices,
      teamMembers,
      subcontractorsCount,
      tasksCount,
      promoUsages,
    ] = await Promise.all([
      prisma.client.count({ where: { tenantId: id } }),
      prisma.estimate.count({ where: { tenantId: id } }),
      prisma.project.count({ where: { tenantId: id, status: { not: 'COMPLETED' } } }),
      prisma.project.count({ where: { tenantId: id, status: 'COMPLETED' } }),
      prisma.invoice.count({ where: { tenantId: id } }),
      prisma.invoice.findMany({ where: { tenantId: id, status: 'PAID' }, select: { total: true } }),
      prisma.invoice.findMany({ where: { tenantId: id, status: { not: 'PAID' } }, select: { total: true } }),
      prisma.teamMember.findMany({ where: { tenantId: id }, select: { firstName: true, lastName: true, role: true, email: true, status: true, createdAt: true } }),
      prisma.subcontractor.count({ where: { tenantId: id } }),
      prisma.scheduleEvent.count({ where: { tenantId: id } }),
      prisma.promoCodeUsage.findMany({ where: { tenantId: id } }),
    ]);

    // Build activity timeline from multiple sources
    const [recentClients, recentProjects, recentInvoices, recentQuotes] = await Promise.all([
      prisma.client.findMany({ where: { tenantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { firstName: true, lastName: true, createdAt: true } }),
      prisma.project.findMany({ where: { tenantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, jobNumber: true, createdAt: true, status: true } }),
      prisma.invoice.findMany({ where: { tenantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { invoiceNumber: true, total: true, status: true, createdAt: true } }),
      prisma.estimate.findMany({ where: { tenantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { estimateNumber: true, total: true, status: true, createdAt: true } }),
    ]);

    const timeline: Array<{ type: string; label: string; createdAt: Date }> = [
      ...recentClients.map(c => ({ type: 'client', label: `Added client ${c.firstName} ${c.lastName}`, createdAt: c.createdAt })),
      ...recentProjects.map(p => ({ type: 'project', label: `Created project ${p.jobNumber} — ${p.name}`, createdAt: p.createdAt })),
      ...recentInvoices.map(i => ({ type: 'invoice', label: `Invoice ${i.invoiceNumber} $${Number(i.total).toFixed(0)} (${i.status})`, createdAt: i.createdAt })),
      ...recentQuotes.map(q => ({ type: 'quote', label: `Quote ${q.estimateNumber} $${Number(q.total).toFixed(0)} (${q.status})`, createdAt: q.createdAt })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20);

    const allDates = [...recentClients, ...recentProjects, ...recentInvoices, ...recentQuotes].map(r => r.createdAt);
    const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;

    return {
      ...tenant,
      stats: {
        clientsCount,
        quotesCount,
        projectsActive,
        projectsCompleted,
        invoicesTotal,
        invoicesPaid: paidInvoices.reduce((s, i) => s + Number(i.total), 0),
        invoicesOutstanding: unpaidInvoices.reduce((s, i) => s + Number(i.total), 0),
        teamMembersCount: teamMembers.length,
        subcontractorsCount,
        tasksCount,
        lastActivity,
      },
      teamMembers,
      timeline,
      promoUsed: promoUsages.length > 0,
    };
  }

  async updateTenant(id: string, data: { plan?: string; status?: string; planExpiresAt?: string | null }) {
    const updateData: any = {};
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.planExpiresAt !== undefined) {
      updateData.planExpiresAt = data.planExpiresAt ? new Date(data.planExpiresAt) : null;
    }
    return prisma.tenant.update({ where: { id }, data: updateData });
  }

  async getReports() {
    const now = new Date();

    // Revenue by month — last 12 months
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const paidInvoicesAll = await prisma.invoice.findMany({
      where: { status: 'PAID', createdAt: { gte: twelveMonthsAgo } },
      select: { total: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = 0;
    }
    for (const inv of paidInvoicesAll) {
      const d = inv.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in revenueByMonth) revenueByMonth[key] += Number(inv.total);
    }

    // New signups per month — last 12 months
    const allTenants = await prisma.tenant.findMany({ select: { plan: true, status: true, createdAt: true } });

    const signupsByMonth: Record<string, number> = {};
    for (const key of Object.keys(revenueByMonth)) signupsByMonth[key] = 0;
    for (const t of allTenants) {
      const d = t.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in signupsByMonth) signupsByMonth[key]++;
    }

    // Plans distribution
    const tenantsByPlan: Record<string, number> = { TRIAL: 0, SOLO: 0, COMPANY: 0, ENTERPRISE: 0, FREE_FOREVER: 0 };
    for (const t of allTenants) {
      const plan = t.plan as string;
      if (plan in tenantsByPlan) tenantsByPlan[plan]++;
      else tenantsByPlan[plan] = (tenantsByPlan[plan] || 0) + 1;
    }

    // Top tenants by paid revenue
    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true, plan: true, status: true, createdAt: true } });
    const topTenants = await Promise.all(
      tenants.map(async (t) => {
        const [paid, clients] = await Promise.all([
          prisma.invoice.findMany({ where: { tenantId: t.id, status: 'PAID' }, select: { total: true } }),
          prisma.client.count({ where: { tenantId: t.id } }),
        ]);
        return {
          id: t.id,
          name: t.name,
          plan: t.plan,
          status: t.status,
          createdAt: t.createdAt,
          invoicesPaid: paid.reduce((s, i) => s + Number(i.total), 0),
          clientsCount: clients,
        };
      }),
    );
    topTenants.sort((a, b) => b.invoicesPaid - a.invoicesPaid);

    return {
      revenueByMonth: Object.entries(revenueByMonth).map(([month, total]) => ({ month, total })),
      signupsByMonth: Object.entries(signupsByMonth).map(([month, count]) => ({ month, count })),
      tenantsByPlan,
      topTenants: topTenants.slice(0, 10),
      totalRevenue: paidInvoicesAll.reduce((s, i) => s + Number(i.total), 0),
      totalTenants: allTenants.length,
    };
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class PromoService implements OnModuleInit {
  async onModuleInit() {
    await this.seedDefaultCodes();
  }

  async seedDefaultCodes() {
    const defaults = [
      {
        code: 'PARTNER90',
        type: 'TRIAL_EXTENSION',
        trialDays: 90,
        plan: 'COMPANY',
        maxUses: 0,
        description: 'Partner program — 90 day trial on Company plan',
      },
      {
        code: 'BETA2026',
        type: 'TRIAL_EXTENSION',
        trialDays: 180,
        plan: 'COMPANY',
        maxUses: 50,
        description: 'Beta testers — 6 month free trial',
      },
      {
        code: 'FREEPARTNER',
        type: 'FREE_FOREVER',
        trialDays: 0,
        plan: 'SOLO',
        maxUses: 0,
        description: 'Free forever for strategic partners',
      },
      {
        code: 'ENTERPRISE90',
        type: 'TRIAL_EXTENSION',
        trialDays: 90,
        plan: 'ENTERPRISE',
        maxUses: 10,
        description: 'Enterprise partners trial',
      },
    ];

    for (const d of defaults) {
      await prisma.promoCode.upsert({
        where: { code: d.code },
        update: {},
        create: d,
      });
    }
  }

  async validateCode(code: string) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!promo || !promo.isActive) {
      return { valid: false, message: 'Invalid or expired promo code' };
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { valid: false, message: 'This promo code has expired' };
    }
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return { valid: false, message: 'This promo code has reached its usage limit' };
    }
    return {
      valid: true,
      type: promo.type,
      trialDays: promo.trialDays,
      discountPercent: promo.discountPercent,
      discountFixed: promo.discountFixed,
      plan: promo.plan,
      description: promo.description,
    };
  }

  async applyCode(code: string, tenantId: string) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!promo || !promo.isActive) {
      return { success: false, message: 'Invalid or expired promo code' };
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { success: false, message: 'This promo code has expired' };
    }
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return { success: false, message: 'This promo code has reached its usage limit' };
    }

    const alreadyUsed = await prisma.promoCodeUsage.findFirst({
      where: { promoCodeId: promo.id, tenantId },
    });
    if (alreadyUsed) {
      return { success: false, message: 'You have already used this promo code' };
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return { success: false, message: 'Tenant not found' };

    let newPlanExpiresAt: Date | null = tenant.planExpiresAt;
    let newPlan = tenant.plan;

    if (promo.type === 'TRIAL_EXTENSION') {
      const base =
        newPlanExpiresAt && newPlanExpiresAt > new Date() ? newPlanExpiresAt : new Date();
      newPlanExpiresAt = new Date(base.getTime() + promo.trialDays * 24 * 60 * 60 * 1000);
      newPlan = promo.plan;
    } else if (promo.type === 'FREE_FOREVER') {
      newPlan = 'FREE_FOREVER';
      newPlanExpiresAt = null;
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: newPlan, planExpiresAt: newPlanExpiresAt },
    });

    await prisma.promoCodeUsage.create({
      data: { promoCodeId: promo.id, tenantId },
    });

    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    const msg =
      promo.type === 'FREE_FOREVER'
        ? 'Free forever account activated! You will never be charged.'
        : `Code applied! Your ${promo.plan} plan extended by ${promo.trialDays} days.`;

    return {
      success: true,
      message: msg,
      newPlanExpiresAt,
      newPlan,
    };
  }
}

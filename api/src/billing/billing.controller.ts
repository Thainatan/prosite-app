/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Post, Get, Body, Headers, Req } from '@nestjs/common';
import { prisma } from '../prisma';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

const PRICE_IDS: Record<string, string> = {
  SOLO: process.env.STRIPE_PRICE_SOLO || '',
  COMPANY: process.env.STRIPE_PRICE_COMPANY || '',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || '',
};

const PLAN_BY_PRICE: Record<string, string> = {};
if (process.env.STRIPE_PRICE_SOLO) PLAN_BY_PRICE[process.env.STRIPE_PRICE_SOLO] = 'SOLO';
if (process.env.STRIPE_PRICE_COMPANY) PLAN_BY_PRICE[process.env.STRIPE_PRICE_COMPANY] = 'COMPANY';
if (process.env.STRIPE_PRICE_ENTERPRISE) PLAN_BY_PRICE[process.env.STRIPE_PRICE_ENTERPRISE] = 'ENTERPRISE';

@Controller('billing')
export class BillingController {
  @Post('create-checkout')
  async createCheckout(@Req() req: any, @Body() body: { plan: string; successUrl: string; cancelUrl: string }) {
    if (!stripe) return { error: 'Stripe not configured' };
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
      if (!tenant) return { error: 'Tenant not found' };

      const priceId = PRICE_IDS[body.plan];
      if (!priceId) return { error: 'Invalid plan' };

      let customerId = tenant.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { tenantId, tenantSlug: tenant.slug },
        });
        customerId = customer.id;
        await prisma.tenant.update({ where: { id: tenantId }, data: { stripeCustomerId: customerId } });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: body.successUrl || `${process.env.FRONTEND_URL}/settings/billing?success=1`,
        cancel_url: body.cancelUrl || `${process.env.FRONTEND_URL}/settings/billing?canceled=1`,
        metadata: { tenantId },
      });

      return { url: session.url };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Get('portal')
  async customerPortal(@Req() req: any) {
    if (!stripe) return { error: 'Stripe not configured' };
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
      if (!tenant?.stripeCustomerId) return { error: 'No billing account found' };

      const session = await stripe.billingPortal.sessions.create({
        customer: tenant.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/settings/billing`,
      });
      return { url: session.url };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Get('status')
  async billingStatus(@Req() req: any) {
    try {
      const tenantId: string = req.user?.tenantId ?? '';
      const tenant = tenantId ? await prisma.tenant.findUnique({ where: { id: tenantId } }) : null;
      if (!tenant) return { error: 'Tenant not found' };

      let daysLeft: number | null = null;
      if (tenant.plan === 'TRIAL' && tenant.planExpiresAt) {
        daysLeft = Math.max(0, Math.ceil((tenant.planExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      }

      return {
        plan: tenant.plan,
        status: tenant.status,
        planExpiresAt: tenant.planExpiresAt,
        daysLeftInTrial: daysLeft,
        hasStripe: !!tenant.stripeCustomerId,
      };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post('webhook')
  async webhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    if (!stripe) return { received: false };
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return { received: false };

    let event: any;
    try {
      event = stripe.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
    } catch (e: any) {
      return { error: `Webhook signature verification failed: ${e.message}` };
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const tenantId = session.metadata?.tenantId;
          if (!tenantId || !session.subscription) break;
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = sub.items.data[0]?.price?.id ?? '';
          const plan = PLAN_BY_PRICE[priceId] ?? 'COMPANY';
          await prisma.tenant.update({
            where: { id: tenantId },
            data: { plan, stripeSubscriptionId: sub.id, planExpiresAt: null, status: 'ACTIVE' },
          });
          break;
        }
        case 'invoice.payment_succeeded': {
          const inv = event.data.object;
          const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
          if (!customerId) break;
          const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
          if (tenant) {
            await prisma.tenant.update({ where: { id: tenant.id }, data: { status: 'ACTIVE' } });
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object;
          const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? '';
          const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
          if (tenant) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: { plan: 'TRIAL', stripeSubscriptionId: '', planExpiresAt: new Date(), status: 'INACTIVE' },
            });
          }
          break;
        }
      }
    } catch (e: any) {
      console.error('Webhook handler error:', e.message);
    }

    return { received: true };
  }
}

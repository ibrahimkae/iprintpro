import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../db.js';
import { verifyHmacSignature } from '../util.js';

const TRIAL_DAYS = 14;

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function isProPlan(plan: string | null | undefined): boolean {
  return typeof plan === 'string' && plan.startsWith('pro');
}

const webhookPayload = z.object({
  userId: z.number().int().positive(),
  plan: z.enum(['free', 'pro_monthly', 'pro_yearly']),
  event: z.enum(['paid', 'canceled']),
});

async function billingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/billing/entitlements', { onRequest: [app.authenticate] }, async (req) => {
    const userId = Number((req.user as { sub: string }).sub);
    const conn = await getPool().getConnection();
    try {
      const rows = await conn.query(
        'SELECT plan, status, current_period_end FROM subscriptions WHERE user_id=?',
        [userId]
      );
      const sub = rows[0];
      const activePro =
        !!sub &&
        isProPlan(sub.plan) &&
        (sub.status === 'active' || sub.status === 'trialing') &&
        new Date(sub.current_period_end).getTime() > Date.now();
      return {
        plan: activePro ? 'pro' : 'free',
        status: sub?.status ?? 'none',
        features: {
          batchUnlimited: activePro,
          marketplace: activePro,
          pos: activePro,
          service: activePro,
          warehouse: activePro,
          customBranding: activePro,
        },
        currentPeriodEnd: sub?.current_period_end ?? null,
      };
    } finally {
      conn.release();
    }
  });

  app.post('/billing/trial', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = Number((req.user as { sub: string }).sub);
    const trialEndsAt = addDays(TRIAL_DAYS);
    const conn = await getPool().getConnection();
    try {
      const existing = await conn.query(
        'SELECT user_id, trial_ends_at FROM subscriptions WHERE user_id=?',
        [userId]
      );
      let affectedRows: number;
      if (existing.length === 0) {
        // Hiç abonelik yok → deneme başlatılamaz engeli yok
        const result = await conn.query(
          `INSERT INTO subscriptions (user_id, plan, status, trial_ends_at, current_period_end, provider)
           VALUES (?, 'pro_monthly', 'trialing', ?, ?, 'manual')`,
          [userId, trialEndsAt, trialEndsAt]
        );
        affectedRows = result.affectedRows;
      } else {
        // trial_ends_at IS NULL guard: daha önce deneme kullanıldıysa 0 satır etkilenir
        const result = await conn.query(
          `UPDATE subscriptions
           SET plan='pro_monthly', status='trialing', trial_ends_at=?, current_period_end=?, provider='manual'
           WHERE user_id=? AND trial_ends_at IS NULL`,
          [trialEndsAt, trialEndsAt, userId]
        );
        affectedRows = result.affectedRows;
      }
      if (affectedRows === 0) {
        return reply.code(409).send({ error: 'Deneme süresi zaten kullanılmış' });
      }
      return reply.code(201).send({ plan: 'pro_monthly', status: 'trialing', trialEndsAt });
    } finally {
      conn.release();
    }
  });

  await app.register(async function webhookScope(webhookApp: FastifyInstance) {
    // İmza ham gövde üzerinden doğrulanır → JSON'u buffer olarak alıp kendimiz çözümlüyoruz
    webhookApp.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => {
      try {
        done(null, { raw: body as Buffer, json: JSON.parse((body as Buffer).toString('utf8')) });
      } catch (err) {
        done(err as Error);
      }
    });

    webhookApp.post('/billing/webhook', async (req, reply) => {
      const secret = process.env.WEBHOOK_SECRET;
      if (!secret) return reply.code(503).send({ error: 'Webhook yapılandırılmadı' });

      const wrapper = req.body as { raw?: Buffer; json?: unknown } | undefined;
      const sigHeader = req.headers['x-signature'];
      const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
      if (!wrapper?.raw || !verifyHmacSignature(wrapper.raw, signature, secret)) {
        return reply.code(403).send({ error: 'Geçersiz imza' });
      }

      const parsed = webhookPayload.safeParse(wrapper.json);
      if (!parsed.success) return reply.code(400).send({ error: 'Webhook verisi geçersiz' });

      const { userId, plan, event } = parsed.data;
      const periodEnd = addDays(plan === 'pro_yearly' ? 365 : 30);
      const conn = await getPool().getConnection();
      try {
        const existing = await conn.query('SELECT user_id FROM subscriptions WHERE user_id=?', [userId]);
        if (event === 'canceled') {
          // Dönem sonuna kadar Pro sürer (SPEC-05 §4)
          if (existing.length === 0) {
            await conn.query(
              `INSERT INTO subscriptions (user_id, plan, status, current_period_end, provider)
               VALUES (?, ?, 'canceled', NOW(), 'manual')`,
              [userId, plan]
            );
          } else {
            await conn.query(
              "UPDATE subscriptions SET plan=?, status='canceled' WHERE user_id=?",
              [plan, userId]
            );
          }
        } else {
          if (existing.length === 0) {
            await conn.query(
              `INSERT INTO subscriptions (user_id, plan, status, current_period_end, provider)
               VALUES (?, ?, 'active', ?, 'manual')`,
              [userId, plan, periodEnd]
            );
          } else {
            await conn.query(
              `UPDATE subscriptions SET plan=?, status='active', current_period_end=? WHERE user_id=?`,
              [plan, periodEnd, userId]
            );
          }
        }
        return reply.send({ ok: true });
      } finally {
        conn.release();
      }
    });
  });
}

export { billingRoutes };

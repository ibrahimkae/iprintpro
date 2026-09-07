import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../db.js';
import { ROLE_MANAGER_UP, requireRole } from '../util.js';

// KVKK: yalnızca anonim olay — müşteri içeriği asla loglanmaz (SPEC-06 §5)
const activityInput = z.object({
  type: z.literal('print'),
  templateId: z.number().int().positive().optional(),
  copies: z.number().int().min(1).max(1000),
  teamId: z.number().int().positive().optional(),
});

const activityQuery = z.object({
  teamId: z.coerce.number().int().positive(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  app.post('/activity', { onRequest: [app.authenticate] }, async (req, reply) => {
    const parsed = activityInput.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Faaliyet verisi geçersiz' });

    const userId = Number((req.user as { sub: string }).sub);
    const { type, templateId, copies, teamId } = parsed.data;

    if (teamId && !(await requireRole(teamId, userId, ['owner', 'manager', 'staff']))) {
      return reply.code(403).send({ error: 'Yetkiniz yok' });
    }

    const conn = await getPool().getConnection();
    try {
      const result = await conn.query(
        'INSERT INTO activity_log (user_id, team_id, type, meta) VALUES (?, ?, ?, ?)',
        [userId, teamId ?? null, type, JSON.stringify({ templateId: templateId ?? null, copies })]
      );
      return reply.code(201).send({ id: Number(result.insertId) });
    } finally {
      conn.release();
    }
  });

  app.get('/activity', { onRequest: [app.authenticate] }, async (req, reply) => {
    const parsed = activityQuery.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'teamId gerekli' });

    const { teamId, from, to } = parsed.data;
    const userId = Number((req.user as { sub: string }).sub);
    // manager+ ekip kayıtlarını görebilir (SPEC-06 §4)
    if (!(await requireRole(teamId, userId, ROLE_MANAGER_UP))) {
      return reply.code(403).send({ error: 'Yetkiniz yok' });
    }

    const conn = await getPool().getConnection();
    try {
      const where = ['team_id=?'];
      const params: (string | number)[] = [teamId];
      if (from) { where.push('created_at >= ?'); params.push(from); }
      if (to) { where.push('created_at <= ?'); params.push(to); }
      return conn.query(
        `SELECT id, user_id, team_id, type, meta, created_at
         FROM activity_log WHERE ${where.join(' AND ')}
         ORDER BY created_at DESC LIMIT 200`,
        params
      );
    } finally {
      conn.release();
    }
  });
}

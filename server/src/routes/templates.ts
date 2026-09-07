import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../db.js';
import { ROLE_MANAGER_UP, ROLE_OWNER, requireRole } from '../util.js';

const templateInput = z.object({
  title: z.string().min(1).max(120),
  category: z.enum(['todo', 'shipping', 'wifi', 'receipt', 'pantry', 'price', 'article', 'editor']),
  payload: z.record(z.unknown()),
  preview_note: z.string().max(280).optional(),
  teamId: z.number().int().positive().optional()
});

export async function templateRoutes(app: FastifyInstance): Promise<void> {
  app.get('/templates', async (req, reply) => {
    const { category, search, scope, teamId } = req.query as {
      category?: string; search?: string; scope?: string; teamId?: string;
    };

    // Ekip kapsamı: üyelik şart (staff dahil görüntüleyebilir)
    let teamScopeId: number | null = null;
    if (scope === 'team') {
      teamScopeId = Number(teamId);
      if (!Number.isInteger(teamScopeId)) return reply.code(400).send({ error: 'Geçersiz id' });
      if (!req.user) return reply.code(401).send({ error: 'Oturum gerekli' });
      const userId = Number((req.user as { sub: string }).sub);
      if (!(await requireRole(teamScopeId, userId, ['owner', 'manager', 'staff']))) {
        return reply.code(403).send({ error: 'Yetkiniz yok' });
      }
    }

    const conn = await getPool().getConnection();
    try {
      const where: string[] = [];
      const params: (string | number)[] = [];
      if (category) { where.push('t.category=?'); params.push(category); }
      if (search) { where.push('t.title LIKE ?'); params.push(`%${search}%`); }
      if (teamScopeId !== null) { where.push('t.team_id=?'); params.push(teamScopeId); }
      const sql = `
        SELECT t.id, t.title, t.category, t.preview_note, t.created_at,
               u.display_name AS author,
               ROUND(t.rating_sum / NULLIF(t.rating_count, 0), 1) AS avg_rating
        FROM templates t JOIN users u ON u.id = t.user_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY t.created_at DESC LIMIT 100`;
      return conn.query(sql, params);
    } finally {
      conn.release();
    }
  });

  app.get('/templates/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ error: 'Geçersiz id' });
    const conn = await getPool().getConnection();
    try {
      const rows = await conn.query(
        `SELECT t.*, u.display_name AS author FROM templates t
         JOIN users u ON u.id=t.user_id WHERE t.id=?`, [id]);
      if (rows.length === 0) return reply.code(404).send({ error: 'Bulunamadı' });
      return rows[0];
    } finally {
      conn.release();
    }
  });

  app.post('/templates', { onRequest: [app.authenticate] }, async (req, reply) => {
    const parsed = templateInput.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Şablon verisi geçersiz' });

    // Payload boyut sınırı: 32KB (JSON olarak)
    if (JSON.stringify(parsed.data.payload).length > 32 * 1024) {
      return reply.code(413).send({ error: 'Şablon verisi çok büyük' });
    }

    const userId = Number((req.user as { sub: string }).sub);

    // Ekip şablonu: üye olmalı ve staff olmamalı
    let teamId: number | null = null;
    if (parsed.data.teamId !== undefined) {
      if (!(await requireRole(parsed.data.teamId, userId, ROLE_MANAGER_UP))) {
        return reply.code(403).send({ error: 'Yetkiniz yok' });
      }
      teamId = parsed.data.teamId;
    }

    const conn = await getPool().getConnection();
    try {
      const result = await conn.query(
        `INSERT INTO templates (user_id, team_id, title, category, payload, preview_note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, teamId, parsed.data.title, parsed.data.category,
         JSON.stringify(parsed.data.payload), parsed.data.preview_note ?? null]
      );
      return reply.code(201).send({ id: Number(result.insertId) });
    } finally {
      conn.release();
    }
  });

  app.delete('/templates/:id', { onRequest: [app.authenticate] }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const userId = Number((req.user as { sub: string }).sub);
    const conn = await getPool().getConnection();
    try {
      const rows = await conn.query('SELECT user_id, team_id FROM templates WHERE id=?', [id]);
      if (rows.length === 0) return reply.code(404).send({ error: 'Bulunamadı veya size ait değil' });
      const template = rows[0];

      let allowed = template.user_id === userId;
      if (!allowed && template.team_id) {
        // staff ekip şablonunu silemez → net 403
        if (!(await requireRole(template.team_id, userId, ROLE_MANAGER_UP))) {
          return reply.code(403).send({ error: 'Yetkiniz yok' });
        }
        allowed = await requireRole(template.team_id, userId, ROLE_OWNER);
      }

      const result = allowed
        ? await conn.query('DELETE FROM templates WHERE id=?', [id])
        : { affectedRows: 0 };
      if (result.affectedRows === 0) return reply.code(404).send({ error: 'Bulunamadı veya size ait değil' });
      return reply.code(204).send();
    } finally {
      conn.release();
    }
  });

  app.post('/templates/:id/rate', { onRequest: [app.authenticate] }, async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const stars = z.number().int().min(1).max(5).parse((req.body as { stars?: number })?.stars);
    const userId = Number((req.user as { sub: string }).sub);

    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();
      const existing = await conn.query(
        'SELECT stars FROM template_ratings WHERE template_id=? AND user_id=? FOR UPDATE', [id, userId]);
      if (existing.length > 0) {
        const diff = stars - existing[0].stars;
        await conn.query('UPDATE template_ratings SET stars=? WHERE template_id=? AND user_id=?', [stars, id, userId]);
        if (diff !== 0) await conn.query('UPDATE templates SET rating_sum=rating_sum+? WHERE id=?', [diff, id]);
      } else {
        await conn.query('INSERT INTO template_ratings (template_id, user_id, stars) VALUES (?, ?, ?)', [id, userId, stars]);
        await conn.query('UPDATE templates SET rating_sum=rating_sum+?, rating_count=rating_count+1 WHERE id=?', [stars, id]);
      }
      await conn.commit();
      return reply.send({ ok: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  });
}

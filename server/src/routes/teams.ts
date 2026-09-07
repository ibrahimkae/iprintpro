import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../db.js';
import { ROLE_MANAGER_UP, ROLE_OWNER, requireRole } from '../util.js';

const createTeam = z.object({
  name: z.string().min(1).max(120),
});

const addMember = z.object({
  email: z.string().email().max(255),
  role: z.enum(['owner', 'manager', 'staff']).optional().default('staff'),
});

const patchRole = z.object({
  role: z.enum(['owner', 'manager', 'staff']),
});

export async function teamRoutes(app: FastifyInstance): Promise<void> {
  app.get('/teams', { onRequest: [app.authenticate] }, async (req) => {
    const userId = Number((req.user as { sub: string }).sub);
    const conn = await getPool().getConnection();
    try {
      return conn.query(
        `SELECT t.id, t.name, t.owner_user_id, tm.role, tm.joined_at
         FROM teams t JOIN team_members tm ON tm.team_id = t.id
         WHERE tm.user_id=? ORDER BY t.created_at DESC`,
        [userId]
      );
    } finally {
      conn.release();
    }
  });

  app.post('/teams', { onRequest: [app.authenticate] }, async (req, reply) => {
    const parsed = createTeam.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Ekip adı geçersiz' });

    const userId = Number((req.user as { sub: string }).sub);
    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();
      const result = await conn.query(
        'INSERT INTO teams (name, owner_user_id) VALUES (?, ?)',
        [parsed.data.name, userId]
      );
      const teamId = Number(result.insertId);
      await conn.query(
        "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'owner')",
        [teamId, userId]
      );
      await conn.commit();
      return reply.code(201).send({ id: teamId });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  });

  app.post('/teams/:id/members', { onRequest: [app.authenticate] }, async (req, reply) => {
    const teamId = Number((req.params as { id: string }).id);
    if (!Number.isInteger(teamId)) return reply.code(400).send({ error: 'Geçersiz id' });

    const parsed = addMember.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Üye verisi geçersiz' });

    const userId = Number((req.user as { sub: string }).sub);
    // owner+manager ekleyebilir (SPEC-06 §4); owner rolü yalnızca owner atanır
    if (parsed.data.role === 'owner') {
      if (!(await requireRole(teamId, userId, ROLE_OWNER))) {
        return reply.code(403).send({ error: 'Yetkiniz yok' });
      }
    } else if (!(await requireRole(teamId, userId, ROLE_MANAGER_UP))) {
      return reply.code(403).send({ error: 'Yetkiniz yok' });
    }

    const conn = await getPool().getConnection();
    try {
      const users = await conn.query('SELECT id FROM users WHERE email=?', [parsed.data.email]);
      if (users.length === 0) return reply.code(404).send({ error: 'Önce uygulamaya kaydolmalı' });
      const memberId = Number(users[0].id);
      try {
        await conn.query(
          'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
          [teamId, memberId, parsed.data.role]
        );
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: 'Zaten üye' });
        throw err;
      }
      return reply.code(201).send({ userId: memberId, role: parsed.data.role });
    } finally {
      conn.release();
    }
  });

  app.delete('/teams/:id/members/:userId', { onRequest: [app.authenticate] }, async (req, reply) => {
    const teamId = Number((req.params as { id: string }).id);
    const targetUserId = Number((req.params as { userId: string }).userId);
    if (!Number.isInteger(teamId) || !Number.isInteger(targetUserId)) {
      return reply.code(400).send({ error: 'Geçersiz id' });
    }

    const actorId = Number((req.user as { sub: string }).sub);
    if (!(await requireRole(teamId, actorId, ROLE_OWNER))) {
      return reply.code(403).send({ error: 'Yetkiniz yok' });
    }
    if (targetUserId === actorId) {
      return reply.code(400).send({ error: 'Kendinizi ekipten çıkaramazsınız' });
    }

    const conn = await getPool().getConnection();
    try {
      const result = await conn.query(
        "DELETE FROM team_members WHERE team_id=? AND user_id=? AND role<>'owner'",
        [teamId, targetUserId]
      );
      if (result.affectedRows === 0) return reply.code(404).send({ error: 'Üye bulunamadı' });
      return reply.code(204).send();
    } finally {
      conn.release();
    }
  });

  app.patch('/teams/:id/members/:userId', { onRequest: [app.authenticate] }, async (req, reply) => {
    const teamId = Number((req.params as { id: string }).id);
    const targetUserId = Number((req.params as { userId: string }).userId);
    if (!Number.isInteger(teamId) || !Number.isInteger(targetUserId)) {
      return reply.code(400).send({ error: 'Geçersiz id' });
    }

    const parsed = patchRole.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Rol verisi geçersiz' });

    const actorId = Number((req.user as { sub: string }).sub);
    if (!(await requireRole(teamId, actorId, ROLE_OWNER))) {
      return reply.code(403).send({ error: 'Yetkiniz yok' });
    }
    if (targetUserId === actorId) {
      return reply.code(400).send({ error: 'Kendi rolünüz değiştirilemez' });
    }

    const conn = await getPool().getConnection();
    try {
      const result = await conn.query(
        "UPDATE team_members SET role=? WHERE team_id=? AND user_id=? AND role<>'owner'",
        [parsed.data.role, teamId, targetUserId]
      );
      if (result.affectedRows === 0) return reply.code(404).send({ error: 'Üye bulunamadı' });
      return reply.send({ ok: true });
    } finally {
      conn.release();
    }
  });
}

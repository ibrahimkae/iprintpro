import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../db.js';

const credentials = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64));
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (req, reply) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Geçersiz e-posta veya şifre (min 8 karakter)' });

    const { email, password } = parsed.data;
    const conn = await getPool().getConnection();
    try {
      const existing = await conn.query('SELECT id FROM users WHERE email=?', [email]);
      if (existing.length > 0) return reply.code(409).send({ error: 'Bu e-posta zaten kayıtlı' });

      const result = await conn.query(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, hashPassword(password)]
      );
      const token = app.jwt.sign({ sub: String(result.insertId), email });
      return reply.code(201).send({ token });
    } finally {
      conn.release();
    }
  });

  app.post('/auth/login', async (req, reply) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Geçersiz istek' });

    const { email, password } = parsed.data;
    const conn = await getPool().getConnection();
    try {
      const rows = await conn.query('SELECT id, password_hash FROM users WHERE email=?', [email]);
      const user = rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) {
        return reply.code(401).send({ error: 'E-posta veya şifre hatalı' });
      }
      const token = app.jwt.sign({ sub: String(user.id), email });
      return reply.send({ token });
    } finally {
      conn.release();
    }
  });

  app.get('/auth/me', { onRequest: [app.authenticate] }, async (req) => {
    const userId = Number((req.user as { sub: string }).sub);
    return { userId, email: (req.user as { email?: string }).email };
  });
}

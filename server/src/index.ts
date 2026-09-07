import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { ensureSchema, getPool } from './db.js';
import { authRoutes } from './routes/auth.js';
import { templateRoutes } from './routes/templates.js';
import { billingRoutes } from './routes/billing.js';
import { teamRoutes } from './routes/teams.js';
import { activityRoutes } from './routes/activity.js';
import { trendyolRoutes } from './routes/trendyol.js';
import { seedDevAccount } from './routes/devseed.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-only-secret-change-me' });

const authenticate = async (req: any, reply: any): Promise<void> => {
  try {
    await req.jwtVerify();
  } catch {
    void reply.code(401).send({ error: 'Oturum gerekli' });
  }
};
app.decorate('authenticate', authenticate as any);

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: any) => Promise<void>;
  }
}

app.get('/health', async () => ({ status: 'ok' }));

await app.register(authRoutes);
await app.register(templateRoutes);
await app.register(billingRoutes);
await app.register(teamRoutes);
await app.register(activityRoutes);
await app.register(trendyolRoutes);

const port = Number(process.env.PORT || 3001);

try {
  // DB yoksa bile sunucu kalksın: Trendyol + auth çalışır; teams/billing DB ister
  try {
    await ensureSchema();
    await seedDevAccount();
  } catch (dbErr) {
    app.log.warn(`DB şema/hesap kurulumu atlandı (DB yok?): ${dbErr instanceof Error ? dbErr.message : dbErr}`);
  }
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`iPrint API listening on :${port}`);
} catch (err) {
  app.log.error(err);
  await getPool().end();
  process.exit(1);
}

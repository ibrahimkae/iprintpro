import { getPool } from '../db.js';
import { hashPassword } from './auth.js';

const DEV_TEST_EMAIL = process.env.DEV_TEST_EMAIL || 'dev@iprint.local';
const DEV_TEST_PASSWORD = process.env.DEV_TEST_PASSWORD || 'iprint-dev-2026';

export async function seedDevAccount(): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    const existing = await conn.query('SELECT id FROM users WHERE email=?', [DEV_TEST_EMAIL]);
    let userId: number;
    if (existing.length === 0) {
      const result = await conn.query(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        [DEV_TEST_EMAIL, hashPassword(DEV_TEST_PASSWORD), 'Dev Test']
      );
      userId = Number(result.insertId);
      console.log(`Dev test hesabı hazır: ${DEV_TEST_EMAIL}`);
    } else {
      userId = Number(existing[0].id);
    }

    const sub = await conn.query('SELECT plan, status, provider FROM subscriptions WHERE user_id=?', [userId]);
    if (sub.length === 0) {
      await conn.query(
        `INSERT INTO subscriptions (user_id, plan, status, current_period_end, provider)
         VALUES (?, 'pro_yearly', 'active', DATE_ADD(NOW(), INTERVAL 10 YEAR), 'manual')`,
        [userId]
      );
      console.log(`Dev test hesabı hazır: ${DEV_TEST_EMAIL}`);
    } else if (sub[0].plan !== 'pro_yearly' || sub[0].status !== 'active' || sub[0].provider !== 'manual') {
      await conn.query(
        `UPDATE subscriptions
         SET plan='pro_yearly', status='active', provider='manual', trial_ends_at=NULL,
             current_period_end=DATE_ADD(NOW(), INTERVAL 10 YEAR)
         WHERE user_id=?`,
        [userId]
      );
      console.log(`Dev test hesabı hazır: ${DEV_TEST_EMAIL}`);
    }
  } finally {
    conn.release();
  }
}

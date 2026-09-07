import { createHmac, timingSafeEqual } from 'node:crypto';
import { getPool } from './db.js';

export type TeamRole = 'owner' | 'manager' | 'staff';

export const ROLE_OWNER: readonly TeamRole[] = ['owner'];
export const ROLE_MANAGER_UP: readonly TeamRole[] = ['owner', 'manager'];
export const ROLE_ANY: readonly TeamRole[] = ['owner', 'manager', 'staff'];

export function verifyHmacSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=') || !secret) return false;
  const provided = signatureHeader.slice('sha256='.length);
  if (!/^[0-9a-fA-F]+$/.test(provided) || provided.length % 2 !== 0) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const received = Buffer.from(provided, 'hex');
  if (expected.length !== received.length || received.length === 0) return false;
  return timingSafeEqual(expected, received);
}

export function roleAllows(actorRole: string | null | undefined, required: readonly TeamRole[]): boolean {
  if (!actorRole) return false;
  return (required as readonly string[]).includes(actorRole);
}

export async function getTeamRole(teamId: number, userId: number): Promise<TeamRole | null> {
  const conn = await getPool().getConnection();
  try {
    const rows = await conn.query('SELECT role FROM team_members WHERE team_id=? AND user_id=?', [teamId, userId]);
    return (rows[0]?.role as TeamRole) ?? null;
  } finally {
    conn.release();
  }
}

export async function requireRole(teamId: number, userId: number, roles: readonly TeamRole[]): Promise<boolean> {
  const role = await getTeamRole(teamId, userId);
  return roleAllows(role, roles);
}

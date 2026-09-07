import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { roleAllows, verifyHmacSignature } from '../src/util.js';

const SECRET = 'test-webhook-secret';

function sign(body: string, secret = SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

test('verifyHmacSignature: valid signature accepted', () => {
  const body = '{"userId":1,"plan":"pro_monthly","event":"paid"}';
  assert.equal(verifyHmacSignature(body, sign(body), SECRET), true);
});

test('verifyHmacSignature: tampered body rejected', () => {
  const body = '{"userId":1,"plan":"pro_monthly","event":"paid"}';
  assert.equal(verifyHmacSignature(`${body} `, sign(body), SECRET), false);
});

test('verifyHmacSignature: wrong secret rejected', () => {
  const body = '{"userId":1}';
  assert.equal(verifyHmacSignature(body, sign(body, 'other-secret'), SECRET), false);
});

test('verifyHmacSignature: missing header rejected', () => {
  assert.equal(verifyHmacSignature('{}', undefined, SECRET), false);
});

test('verifyHmacSignature: empty header rejected', () => {
  assert.equal(verifyHmacSignature('{}', '', SECRET), false);
});

test('verifyHmacSignature: non-sha256 prefix rejected', () => {
  const body = '{}';
  const sig = `md5=${createHmac('md5', SECRET).update(body).digest('hex')}`;
  assert.equal(verifyHmacSignature(body, sig, SECRET), false);
});

test('verifyHmacSignature: malformed hex rejected', () => {
  assert.equal(verifyHmacSignature('{}', 'sha256=zzzz-not-hex', SECRET), false);
});

test('verifyHmacSignature: odd-length hex rejected', () => {
  assert.equal(verifyHmacSignature('{}', 'sha256=abc', SECRET), false);
});

test('verifyHmacSignature: signature for different payload rejected', () => {
  const sig = sign('{"userId":2}');
  assert.equal(verifyHmacSignature('{"userId":3}', sig, SECRET), false);
});

test('verifyHmacSignature: empty body with correct signature accepted', () => {
  assert.equal(verifyHmacSignature('', sign(''), SECRET), true);
});

test('verifyHmacSignature: buffer body accepted', () => {
  const body = Buffer.from('{"ok":true}');
  assert.equal(verifyHmacSignature(body, sign(body.toString()), SECRET), true);
});

test('verifyHmacSignature: uppercase hex accepted (case-insensitive hex)', () => {
  const body = '{}';
  const upper = sign(body).toUpperCase();
  assert.equal(verifyHmacSignature(body, `sha256=${upper.slice('sha256='.length)}`, SECRET), true);
});

test('roleAllows: owner satisfies owner-only guard', () => {
  assert.equal(roleAllows('owner', ['owner']), true);
});

test('roleAllows: manager blocked from owner-only guard', () => {
  assert.equal(roleAllows('manager', ['owner']), false);
});

test('roleAllows: staff blocked from manager-up guard', () => {
  assert.equal(roleAllows('staff', ['owner', 'manager']), false);
});

test('roleAllows: manager passes manager-up guard', () => {
  assert.equal(roleAllows('manager', ['owner', 'manager']), true);
});

test('roleAllows: staff passes any-member guard', () => {
  assert.equal(roleAllows('staff', ['owner', 'manager', 'staff']), true);
});

test('roleAllows: unknown role rejected', () => {
  assert.equal(roleAllows('admin', ['owner', 'manager']), false);
});

test('roleAllows: null/undefined role rejected', () => {
  assert.equal(roleAllows(null, ['owner', 'manager', 'staff']), false);
  assert.equal(roleAllows(undefined, ['owner']), false);
});

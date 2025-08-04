import crypto from 'crypto';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hashed}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashed] = stored.split(':');
  const verify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hashed, 'hex'),
    Buffer.from(verify, 'hex')
  );
}

function base64url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function signToken(payload: object, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64url(Buffer.from(JSON.stringify(header)));
  const p = base64url(Buffer.from(JSON.stringify(payload)));
  const data = `${h}.${p}`;
  const s = base64url(
    crypto.createHmac('sha256', secret).update(data).digest()
  );
  return `${data}.${s}`;
}

export function verifyToken(token: string, secret: string): any | null {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const data = `${h}.${p}`;
  const expected = base64url(
    crypto.createHmac('sha256', secret).update(data).digest()
  );
  if (expected !== s) return null;
  try {
    return JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

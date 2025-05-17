import crypto from 'crypto';

const tokens = new Map<string, string>();

export function storeMagicToken(email: string, token: string): void {
  tokens.set(token, email);
}

function signJwt(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: email })).toString('base64url');
  const secret = process.env.JWT_SECRET || 'demo-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyMagicLink(token: string): string {
  const email = tokens.get(token);
  if (!email) {
    throw new Error('Invalid or expired token');
  }
  tokens.delete(token);
  return signJwt(email);
}

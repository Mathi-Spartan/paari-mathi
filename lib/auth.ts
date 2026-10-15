// Web Crypto only, so this works in middleware (edge) and server actions (node).
const enc = new TextEncoder();
export const SESSION_COOKIE = 'pm_session';
export const SESSION_DAYS = 180;

function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(data: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export async function makeSessionToken() {
  const exp = Date.now() + SESSION_DAYS * 86400000;
  const payload = `v1.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const [v, exp, sig] = token.split('.');
  if (!v || !exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  try {
    return (await hmac(`${v}.${exp}`)) === sig;
  } catch {
    return false;
  }
}

async function pbkdf2(pin: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 120000 }, key, 256);
  return hex(bits);
}

export async function hashPin(pin: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  return `${salt}:${await pbkdf2(pin, salt)}`;
}

export async function checkPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  return (await pbkdf2(pin, salt)) === hash;
}

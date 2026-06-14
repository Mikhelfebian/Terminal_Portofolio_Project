import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const token = {
    ...payload,
    iat: now,
    exp: now + 7200,
  };

  const header64 = base64url(Buffer.from(JSON.stringify(header)));
  const payload64 = base64url(Buffer.from(JSON.stringify(token)));
  const signature = createHmac('sha256', secret)
    .update(`${header64}.${payload64}`)
    .digest('base64url');

  return `${header64}.${payload64}.${signature}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};

    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      return res.status(500).json({ error: 'Server not configured. Set ADMIN_PASSWORD and JWT_SECRET in Vercel env.' });
    }

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    const token = createJWT({ role: 'admin', jti: randomBytes(16).toString('hex') }, jwtSecret);

    res.json({ token, expiresIn: 7200 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

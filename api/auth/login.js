import { createHmac, randomBytes } from 'crypto';

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

export async function POST(request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      return Response.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = createJWT({ role: 'admin', jti: randomBytes(16).toString('hex') }, jwtSecret);

    return Response.json({ token, expiresIn: 7200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

import { createHmac, timingSafeEqual } from 'crypto';

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header64, payload64, signature] = parts;

    const expectedSig = createHmac('sha256', secret)
      .update(`${header64}.${payload64}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'base64url');
    const expBuf = Buffer.from(expectedSig, 'base64url');

    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const payload = JSON.parse(Buffer.from(payload64, 'base64url').toString());

    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('portfolio').select('*').eq('id', 1).maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data || {});
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ error: 'Server not configured' }, { status: 500 });
    }

    const payload = verifyJWT(authHeader.slice(7), jwtSecret);
    if (!payload || payload.role !== 'admin') {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('portfolio')
      .upsert({ id: 1, ...body })
      .select()
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

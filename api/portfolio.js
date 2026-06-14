import { createHmac, timingSafeEqual } from 'crypto';

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

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel env.' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('portfolio').select('*').eq('id', 1).maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(data || {});
    }

    if (req.method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured' });
      }

      const payload = verifyJWT(authHeader.slice(7), jwtSecret);
      if (!payload || payload.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid or expired token. Login ulang.' });
      }

      const body = req.body;
      const { data, error } = await supabase
        .from('portfolio')
        .upsert({ id: 1, ...body })
        .select()
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

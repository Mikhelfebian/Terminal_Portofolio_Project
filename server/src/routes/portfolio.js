import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: { persistSession: false },
});

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) return res.status(502).json({ error: 'Database query failed' });
    if (!data) return res.json({});

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return res.status(422).json({ error: 'Request body is required' });
    }

    const { data, error } = await supabase
      .from('portfolio')
      .upsert({ id: 1, ...body })
      .select()
      .maybeSingle();

    if (error) return res.status(502).json({ error: 'Database write failed' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;

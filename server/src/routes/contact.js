import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(422).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ error: 'Valid email is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(422).json({ error: 'Message must be at least 10 characters' });
    }

    const sanitized = {
      name: name.trim().replace(/<[^>]*>/g, ''),
      email: email.trim().toLowerCase(),
      message: message.trim().replace(/<[^>]*>/g, ''),
    };

    // Try Formspree if configured
    if (config.contact.formspreeId) {
      const formRes = await fetch(`https://formspree.io/f/${config.contact.formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(sanitized),
      });

      if (!formRes.ok) {
        const errData = await formRes.json().catch(() => ({}));
        return res.status(502).json({ error: errData.error || 'Contact service error' });
      }

      return res.json({ success: true });
    }

    // Fallback: log to console in dev
    if (config.isDev) {
      console.log('📬 Contact submission:', sanitized);
      return res.json({ success: true, note: 'Logged to console (dev mode)' });
    }

    return res.status(501).json({ error: 'No contact service configured' });
  } catch (err) {
    next(err);
  }
});

export default router;

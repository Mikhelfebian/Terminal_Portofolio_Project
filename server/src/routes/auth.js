import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};

  if (!password || typeof password !== 'string') {
    return res.status(422).json({ error: 'Password is required' });
  }

  if (password !== config.secrets.adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    config.secrets.jwtSecret,
    { expiresIn: '2h' },
  );

  return res.json({ token });
});

export default router;

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

function required(key) {
  const val = process.env[key];
  if (!val && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val || '';
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  secrets: {
    githubToken: required('GITHUB_TOKEN'),
    openrouterKey: required('OPENROUTER_API_KEY'),
    adminPassword: required('ADMIN_PASSWORD'),
    jwtSecret: required('JWT_SECRET'),
  },

  supabase: {
    url: required('SUPABASE_URL'),
    serviceKey: required('SUPABASE_SERVICE_KEY'),
  },

  contact: {
    formspreeId: process.env.VITE_FORMSPREE_ID || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    to: process.env.CONTACT_TO || '',
  },
};

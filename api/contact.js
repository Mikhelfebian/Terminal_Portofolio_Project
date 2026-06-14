export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(422).json({ error: 'Semua bidang wajib diisi.' });
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return res.status(422).json({ error: 'Input terlalu panjang.' });
    }

    const sanitize = (str) => str.replace(/<[^>]*>/g, '');

    const payload = {
      name: sanitize(name.trim()),
      email: sanitize(email.trim()),
      message: sanitize(message.trim()),
    };

    const formspreeId = process.env.VITE_FORMSPREE_ID;
    if (formspreeId) {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return res.status(502).json({ error: 'Gagal mengirim pesan ke penyedia email.' });
      }

      return res.json({ success: true, message: 'Pesan terkirim!' });
    }

    console.log('[Contact]', JSON.stringify(payload));
    res.json({ success: true, message: 'Pesan terkirim (dev mode)!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

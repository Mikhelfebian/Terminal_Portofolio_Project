export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Semua bidang wajib diisi.' }, { status: 422 });
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return Response.json({ error: 'Input terlalu panjang.' }, { status: 422 });
    }

    const sanitize = (str) => str.replace(/<[^>]*>/g, '');

    const payload = {
      name: sanitize(name.trim()),
      email: sanitize(email.trim()),
      message: sanitize(message.trim()),
    };

    if (process.env.VITE_FORMSPREE_ID) {
      const res = await fetch(`https://formspree.io/f/${process.env.VITE_FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return Response.json({ error: 'Gagal mengirim pesan ke penyedia email.' }, { status: 502 });
      }

      return Response.json({ success: true, message: 'Pesan terkirim!' });
    }

    console.log('[Contact]', JSON.stringify(payload));
    return Response.json({ success: true, message: 'Pesan terkirim (dev mode)!' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

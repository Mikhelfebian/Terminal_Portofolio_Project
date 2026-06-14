export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(422).json({ error: 'messages array is required and must not be empty' });
    }

    if (messages.some((m) => !m.role || !m.content || typeof m.content !== 'string')) {
      return res.status(422).json({ error: 'Each message must have role and content (string)' });
    }

    if (messages.length > 20) {
      return res.status(422).json({ error: 'Maximum 20 messages allowed per request' });
    }

    const systemMsg = {
      role: 'system',
      content: `Kamu adalah asisten AI yang membantu dan ramah. Jawab dalam bahasa Indonesia yang santai dan natural untuk pertanyaan umum. JANGAN gunakan markdown.

Namun, jika pengguna bertanya tentang coding, pemrograman, IT, teknologi, atau topik teknis lainnya, kamu harus:
- Berpikir secara mendalam dan terstruktur
- Memberikan jawaban yang detail, akurat, dan teknis
- Gunakan analogi yang tepat dan contoh konkret
- Tunjukkan proses berpikir logis
- Bersikap serius dan profesional
- Jika perlu, jelaskan trade-off, best practices, dan alternatif solusi

Kamu bukan asisten portofolio — kamu adalah AI serba bisa yang unggul dalam diskusi teknis.`,
    };

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured in Vercel env' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [systemMsg, ...messages.slice(-10)],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `OpenRouter: ${response.status}`;
      return res.status(response.status).json({ error: errMsg });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: 'AI returned empty response' });
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

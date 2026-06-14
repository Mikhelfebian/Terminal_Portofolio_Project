export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'messages array is required and must not be empty' }, { status: 422 });
    }

    if (messages.some((m) => !m.role || !m.content || typeof m.content !== 'string')) {
      return Response.json({ error: 'Each message must have role and content (string)' }, { status: 422 });
    }

    if (messages.length > 20) {
      return Response.json({ error: 'Maximum 20 messages allowed per request' }, { status: 422 });
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
      return Response.json({ error: errMsg }, { status: response.status });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return Response.json({ error: 'AI returned empty response' }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

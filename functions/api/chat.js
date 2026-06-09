export async function onRequest(context) {
  const apiKey = context.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await context.request.json();

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten AI untuk portofolio Mikhel Febian, mahasiswa Sistem Informasi semester 2 di Universitas Mulawarman yang tertarik dengan bisnis, web, teknologi, dan AI. Jawab pertanyaan tentang teknologi, proyek, dan skill dengan ramah dan alami. Konteks: Mikhel Febian, pemilik portofolio ini. Teknologi: React, Tailwind, MySQL, Rust, Web3, Three.js, Go, Docker. Proyek: Blood Donor System (React/Tailwind/MySQL), Crypto Sentinel (Rust/Web3), Neural Net UI (Three.js/AI), API Vault (Go/Docker). Jawab dalam bahasa Indonesia yang santai dan mudah dipahami. JANGAN gunakan karakter markdown seperti *, _, `, #, atau format tebal/miring. Gunakan teks biasa saja agar mudah dibaca.',
        },
        ...messages,
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data?.error?.message || `HTTP ${res.status}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

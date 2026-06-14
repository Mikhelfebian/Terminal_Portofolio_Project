export async function sendContactMessage({ name, email, message }) {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.error || 'Gagal mengirim pesan' };
    }

    return { success: true, message: 'Pesan Anda telah berhasil dikirim!' };
  } catch {
    return { success: false, message: 'Gagal terhubung ke server pengiriman.' };
  }
}

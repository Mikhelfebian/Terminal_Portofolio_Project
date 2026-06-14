import { useState } from 'react';
import { sendContactMessage } from '../services/contact';
import { usePortfolio } from '../context/PortfolioContext';

export function ContactBlock({ onTriggerAdmin }) {
  const { addLog } = usePortfolio();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Easter Egg Logic: Login Admin Rahasia
    if (formData.name.trim() === "Mikhel Febian" && 
        formData.email.trim() === "login admin" && 
        formData.message.trim() === "helloworld") {
        addLog('INFO', 'Easter Egg terpicu: Membuka portal admin...', 'text-primary');
        onTriggerAdmin();
        setFormData({ name: '', email: '', message: '' });
        return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Semua bidang wajib diisi.' });
      return;
    }

    setStatus({ type: 'submitting', message: 'Mengirim transmisi...' });
    const result = await sendContactMessage(formData);

    if (result.success) {
      setStatus({ type: 'success', message: 'Pesan terkirim!' });
      setFormData({ name: '', email: '', message: '' });
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  };

  // Desain Input yang lebih bersih dan minimalis
  const inputStyle = "w-full bg-surface-container-lowest text-on-surface text-sm p-4 border border-border focus:border-primary focus:outline-none transition-all duration-300 placeholder:text-on-surface-variant/30";

  return (
    <div className="w-full">
      {status.type === 'success' ? (
        <div className="p-6 border border-success-green/20 bg-success-green/5 text-success-green text-sm text-center rounded-lg">
            {status.message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            className={inputStyle} 
            placeholder="Nama lengkap"
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input 
            type="text" 
            className={inputStyle} 
            placeholder="Email anda"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <textarea 
            className={`${inputStyle} min-h-[120px]`} 
            placeholder="Tulis pesan anda..."
            value={formData.message} 
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          
          <button
            type="submit"
            className="w-full py-4 bg-primary text-on-primary font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-primary-container transition-all duration-300 active:scale-[0.98]"
            disabled={status.type === 'submitting'}
          >
            {status.type === 'submitting' ? 'MENGIRIM...' : 'KIRIM PESAN'}
          </button>
        </form>
      )}
    </div>
  );
}

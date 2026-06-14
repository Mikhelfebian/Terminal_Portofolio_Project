import { useState, useEffect, useRef } from 'react';

export function ChatFloating() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 340 : 780,
    y: typeof window !== 'undefined' ? window.innerHeight - 480 : 520,
  }));
  const dragRef = useRef({ active: false, ox: 0, oy: 0 });
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya asisten AI portofolio Mikhel Febian. Tanyakan tentang proyek, keahlian, atau pengalaman yang ada di sini!' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    const context = messages
      .slice(1)
      .concat(userMsg)
      .slice(-10)
      .map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: context }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (!data.reply) throw new Error('AI returned empty response');
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Maaf, sedang terjadi gangguan. Coba lagi nanti.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startDrag = (e) => {
    dragRef.current = { active: true, ox: e.clientX - pos.x, oy: e.clientY - pos.y };
  };

  useEffect(() => {
    if (!open) return;
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      setPos({ x: e.clientX - dragRef.current.ox, y: e.clientY - dragRef.current.oy });
    };
    const onUp = () => { dragRef.current.active = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [open]);

  const bubble = (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer active:scale-90 flex items-center justify-center hover:scale-110 border border-primary/20"
      style={open ? { display: 'none' } : undefined}
    >
      <span className="material-symbols-outlined text-3xl">smart_toy</span>
    </button>
  );

  if (!open) return bubble;

  return (
    <>
      <div
        className="fixed z-50 bg-surface-container border border-border shadow-2xl flex flex-col overflow-hidden"
        style={isMobile
          ? { left: 8, top: 8, width: 'calc(100vw - 16px)', height: 'calc(100dvh - 16px)' }
          : { left: pos.x, top: pos.y, width: 330, height: 430 }
        }
      >
        <div
          className="bg-surface-container-high border-b border-border px-3 py-2.5 flex items-center justify-between flex-shrink-0 cursor-move select-none"
          onMouseDown={startDrag}
          onTouchStart={(e) => startDrag(e.touches[0])}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
            <span className="font-code-display text-caption font-bold text-primary">AI ASISTEN</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-on-surface-variant hover:text-primary cursor-pointer active:opacity-80 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-3 bg-surface-container-lowest">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 border ${
                msg.role === 'user'
                  ? 'bg-primary-glow/10 border-primary/20'
                  : 'bg-surface-container border-border'
              }`}>
                <div className="font-code-sm text-[11px] text-text-bright opacity-50 mb-1">
                  {msg.role === 'user' ? 'visitor@guest' : 'ai@assistant'}:
                </div>
                <div className={`font-body-md text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' ? 'text-primary' : 'text-on-surface'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="border border-border p-3 bg-surface-container">
                <div className="flex items-center gap-1.5 font-code-sm text-[12px] text-primary">
                  <span>MENGANALISIS DATA</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-surface-container px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-code-sm text-sm">{'>'}</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 font-body-md text-[13px] placeholder:text-on-surface-variant placeholder:opacity-50 outline-none"
              placeholder="Masukkan kueri..."
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !chatInput.trim()}
              className="text-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

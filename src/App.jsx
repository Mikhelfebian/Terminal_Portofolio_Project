import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchPortfolio, savePortfolio } from './supabase.js';

const navItems = [
  { id: 'root', label: 'BERANDA', icon: 'home_storage' },
  { id: 'exec', label: 'EKSEKUSI', icon: 'terminal' },
  { id: 'data', label: 'DATA', icon: 'grid_view' },
  { id: 'logs', label: 'LOG', icon: 'history' },
];

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'helloworld';
const STORAGE_KEY = 'bio_portfolio_data';

function defaultData() {
  return {
    about: 'Arsitek full-stack yang berspesialisasi dalam sistem terdistribusi dan frontend React. Menguasai React, Tailwind, MySQL, Rust, Web3, Three.js, Go, Docker.',
    projects: [
      { num: '01', title: 'Blood Donor System', tags: ['REACT', 'TAILWIND', 'MYSQL'], url: '#' },
      { num: '02', title: 'Crypto Sentinel', tags: ['RUST', 'WEB3'], url: '#' },
      { num: '03', title: 'Neural Net UI', tags: ['THREE.JS', 'AI'], url: '#' },
      { num: '04', title: 'API Vault', tags: ['GO', 'DOCKER'], url: '#' },
    ],
    socials: [
      { label: 'Instagram', url: 'https://instagram.com/username_mu', abbr: 'ig' },
      { label: 'GitHub', url: 'https://github.com/username_mu', abbr: 'gh' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/username_mu', abbr: 'li' },
    ],
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultData(), ...JSON.parse(raw) } : defaultData();
  } catch {
    return defaultData();
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  savePortfolio(data.about, data.projects, data.socials);
}

function App() {
  const [input, setInput] = useState('');
  const [activeNav, setActiveNav] = useState('root');
  const [showInput, setShowInput] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [history, setHistory] = useState([
    { id: 'welcome', type: 'system', component: <WelcomeBlock /> },
    { id: 'entropy', type: 'system', component: <EntropyBlock /> },
  ]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (showInput) {
      inputRef.current?.focus();
      scrollToBottom();
    }
  }, [showInput, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  useEffect(() => {
    fetchPortfolio().then((res) => {
      if (res) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ about: res.about, projects: res.projects, socials: res.socials }));
      }
    });
  }, []);

  const executeCommand = useCallback((cmd, skipEcho) => {
    if (!cmd) return;

    const currentHistory = skipEcho ? [...history] : [...history];

    if (!skipEcho) {
      currentHistory.push({
        id: `echo-${Date.now()}`,
        type: 'echo',
        component: (
          <div className="flex items-center space-x-2">
            <span className="font-body-md text-primary font-bold">visitor@user:~$</span>
            <span className="font-body-md text-text-main">{cmd}</span>
          </div>
        ),
      });
    }

    switch (cmd) {
      case 'help':
        currentHistory.push({
          id: `help-${Date.now()}`,
          type: 'output',
          component: (
            <div className="p-3 border-l-2 border-primary-glow bg-surface-container-lowest space-y-1">
              <p className="text-primary font-body-md">Protokol yang Tersedia:</p>
              <p className="font-body-md text-text-main">  about    - Menampilkan profil dan gambaran pengembang</p>
              <p className="font-body-md text-text-main">  projects - Menampilkan proyek dan repository</p>
              <p className="font-body-md text-text-main">  socials  - Menampilkan tautan media sosial</p>
              <p className="font-body-md text-text-main">  exec     - Membuka halaman eksekusi perintah</p>
              <p className="font-body-md text-text-main">  clear    - Membersihkan terminal</p>
            </div>
          ),
        });
        break;

      case 'about':
        currentHistory.push({
          id: `about-${Date.now()}`,
          type: 'output',
          component: <AboutBlock />,
        });
        break;

      case 'projects':
        currentHistory.push({
          id: `projects-${Date.now()}`,
          type: 'output',
          component: <ProjectsBlock />,
        });
        break;

      case 'socials':
        currentHistory.push({
          id: `socials-${Date.now()}`,
          type: 'output',
          component: <SocialsBlock />,
        });
        break;

      case 'exec':
        setActiveNav('exec');
        setShowInput(false);
        return;

      case 'login':
        setShowAdmin(true);
        setShowInput(false);
        setInput('');
        return;

      case 'logout':
        setShowAdmin(false);
        setInput('');
        return;

      case 'clear':
        setHistory([
          { id: 'welcome', type: 'system', component: <WelcomeBlock /> },
          { id: 'entropy', type: 'system', component: <EntropyBlock /> },
        ]);
        setInput('');
        return;

      default:
        currentHistory.push({
          id: `err-${Date.now()}`,
          type: 'error',
          component: (
            <div className="border border-border/50 bg-surface p-3 space-y-2 animate-fade-in">
              <p className="font-body-md text-body-md text-text-main">
                Hmm, perintah "<span className="text-primary">{cmd.toLowerCase()}</span>" tidak saya kenal.
              </p>
              <p className="font-code-sm text-code-sm text-text-muted">
                Coba ketik <span className="text-primary">help</span> untuk melihat daftar perintah yang tersedia.
              </p>
            </div>
          ),
        });
        break;
    }

    setHistory(currentHistory);
    setInput('');
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input.trim().toLowerCase());
    }
  };

  const handleNavClick = (id) => {
    setActiveNav(id);
    setShowInput(false);
    setShowAdmin(false);
  };

  const pageTitle = 'SYS//LINK_BIO_V1.0';

  return (
    <div className="flex items-center justify-center min-h-screen p-0 md:p-4 overflow-hidden bg-background">
      <main className="relative w-full max-w-[440px] md:max-w-[640px] h-screen md:h-[calc(100vh-48px)] md:min-h-[600px] md:max-h-[960px] bg-surface flex flex-col border-0 md:border md:border-border md:rounded-xl shadow-2xl overflow-hidden pb-16">
        {showAdmin ? (
          <AdminPage onClose={() => { setShowAdmin(false); setShowInput(true); setActiveNav('root'); }} />
        ) : (
          <>
        {activeNav === 'root' && (
          <>
            <div className="crt-overlay absolute inset-0 z-50 pointer-events-none"></div>
            <div className="scanline z-50 pointer-events-none"></div>
          </>
        )}

        <header className="bg-surface-dim border-b border-outline-variant w-full top-0 sticky z-40 flex justify-between items-center px-edge-margin h-12 flex-shrink-0">
          <div className="flex items-center gap-2">
            {activeNav !== 'root' && (
              <span className="material-symbols-outlined text-headline-md text-primary">terminal</span>
            )}
            <h1 className="font-headline-md text-headline-md text-text-muted tracking-tighter truncate">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {activeNav === 'logs' && (
              <span className="font-label-md text-label-md text-primary animate-pulse">LANGSUNG</span>
            )}
            {activeNav === 'root' ? (
              <button onClick={() => inputRef.current?.focus()} className="cursor-pointer active:opacity-80 text-primary">
                <span className="material-symbols-outlined">terminal</span>
              </button>
            ) : (
              <button onClick={() => setActiveNav('root')} className="cursor-pointer active:opacity-80 text-primary hover:bg-primary-glow transition-colors px-2 rounded-lg">
                <span className="font-headline-md text-headline-md">[X]</span>
              </button>
            )}
          </div>
        </header>

        {activeNav === 'root' && (
          <div className="flex flex-col flex-1 min-h-0">
            <section
              ref={containerRef}
              className="flex-1 overflow-y-auto no-scrollbar p-edge-margin space-y-6 pb-6 animate-fade-in"
            >
              {history.map((item, idx) => (
                <div key={item.id} className="space-y-2 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {item.component}
                </div>
              ))}
            </section>

              <footer className="flex-shrink-0 w-full bg-surface-dim border-t border-outline-variant p-edge-margin z-40">
                <div className="flex items-center space-x-2">
                  <label className="font-body-md text-primary font-bold whitespace-nowrap" htmlFor="terminal-input">
                    visitor@user:~$
                  </label>
                  <div className="relative flex-grow flex items-center">
                    <input
                      id="terminal-input"
                      type="text"
                      autoComplete="off"
                      spellCheck="false"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="bg-transparent border-none outline-none focus:ring-0 w-full font-body-md text-text-main p-0"
                      placeholder="ketik perintah..."
                      ref={inputRef}
                    />
                    <span className="text-primary font-bold cursor-blink ml-1">_</span>
                  </div>
                  <button
                    onClick={() => executeCommand(input.trim().toLowerCase())}
                    disabled={!input.trim()}
                    className="text-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:opacity-80"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </div>
              </footer>
          </div>
        )}

        {activeNav === 'exec' && (
          <ExecPage
            onNavigate={(cmd) => {
              setActiveNav('root');
              setShowInput(true);
              setTimeout(() => executeCommand(cmd, true), 100);
            }}
          />
        )}
        {activeNav === 'data' && <DataPage />}
        {activeNav === 'logs' && <LogsPage />}
        </>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around items-center px-gutter-tight py-3 max-w-[440px] md:max-w-[640px] mx-auto bg-surface border-t md:border md:border-border md:border-t md:rounded-b-xl border-outline-variant">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-primary bg-primary-glow border border-primary rounded-lg px-3 py-1'
                  : 'text-on-surface-variant opacity-60 hover:text-primary hover:bg-primary-glow transition-colors'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <ChatFloating />
    </div>
  );
}

function ExecPage({ onNavigate }) {
  const [activeCmd, setActiveCmd] = useState(null);
  const [feedback, setFeedback] = useState('');

  const execItems = [
    { cmd: 'run portfolio', desc: 'Membuka viewer portofolio 3D dan modul dokumentasi proyek.', action: 'projects' },
    { cmd: 'deploy contact', desc: 'Membangun jalur komunikasi terenkripsi ke operator utama.', action: 'socials' },
    { cmd: 'sudo bio', desc: 'Mengakses data profil root dan parameter konfigurasi sistem.', action: 'about' },
    { cmd: 'fetch socials', desc: 'Menghubungkan dan mengambil alamat node di seluruh platform.', action: 'socials' },
  ];

  const handleExec = (item) => {
    setActiveCmd(item.cmd);
    setFeedback(`> Mengeksekusi ${item.cmd}...`);
    setTimeout(() => {
      setActiveCmd(null);
      setFeedback('');
      onNavigate(item.action);
    }, 800);
  };

  return (
    <section className="flex-grow overflow-y-auto no-scrollbar p-edge-margin space-y-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary font-bold font-body-md">guest@sys_link:</span>
          <span className="text-on-surface-variant font-body-md">~</span>
          <span className="text-on-surface font-body-md">$</span>
          <span className="text-primary font-body-md terminal-glow">ls -exec</span>
          <span className="inline-block w-[6px] h-4 bg-primary align-middle ml-1 cursor-blink"></span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant opacity-80">
          Direktori: /root/commands/tersedia
        </p>
      </div>

      <div className="grid grid-cols-1 gap-stack-gap">
        {execItems.map((item) => (
          <div
            key={item.cmd}
            onClick={() => handleExec(item)}
            className={`group border border-border p-4 bg-surface hover:bg-primary-glow transition-all duration-200 cursor-pointer relative overflow-hidden shimmer-overlay ${
              activeCmd === item.cmd ? 'opacity-50' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold font-headline-md text-headline-md">{item.cmd}</span>
              </div>
              <span className="font-code-sm text-code-sm text-primary border border-primary px-2 py-0.5">[SIAP]</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-primary text-xs">&gt; Menginisialisasi environment...</span>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="font-code-sm text-code-sm text-primary animate-pulse">{feedback}</div>
      )}

      <div className="border border-border p-4 bg-surface relative overflow-hidden shimmer-overlay">
        <div className="flex justify-between mb-2">
          <span className="font-label-md text-label-md text-on-surface">BEBAN_SISTEM</span>
          <span className="font-label-md text-label-md text-primary">042%</span>
        </div>
        <div className="h-4 bg-surface-container-low border border-outline-variant relative overflow-hidden">
          <div
            className="h-full bg-primary opacity-80 transition-all duration-[2s] ease-out"
            style={{ width: '42%' }}
          ></div>
        </div>
      </div>
    </section>
  );
}

function DataPage() {
  const [animateBars, setAnimateBars] = useState(false);
  const [logs, setLogs] = useState([
    '[14:22:01] GET /api/v1/profile -> 200 OK',
    '[14:22:05] DB_QUERY: SELECT analytics FROM core',
    '[14:23:44] REFRESH_DATA: Sukses (0.04ms)',
  ]);
  const [dataInput, setDataInput] = useState('');

  useEffect(() => {
    const barTimer = setTimeout(() => setAnimateBars(true), 300);
    const logInterval = setInterval(() => {
      const newLogs = [
        '[14:24:12] SOCKET: Terhubung',
        '[14:25:01] SINKRON: data_cluster_a',
        '[14:26:30] AUTH: session_diperbarui',
        '[14:27:02] MEMORI: 42% penggunaan',
        '[14:28:15] CACHE: Dibersihkan',
        '[14:29:44] API: Health check OK',
      ];
      setLogs((prev) => {
        const next = [...prev, newLogs[Math.floor(Math.random() * newLogs.length)]];
        return next.length > 15 ? next.slice(-15) : next;
      });
    }, 4000);
    return () => { clearTimeout(barTimer); clearInterval(logInterval); };
  }, []);

  const handleDataCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = dataInput.trim().toLowerCase();
      if (cmd === 'clear') {
        setLogs([]);
      } else if (cmd === 'refresh') {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] REFRESH: Data diperbarui`]);
      } else if (cmd.startsWith('filter')) {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] FILTER: Menerapkan filter...`]);
      } else {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] CMD: '${cmd}' tidak dikenal`]);
      }
      setDataInput('');
    }
  };

  const barData = [
    { day: 'SEN', req: '420 REQ', pct: 45 },
    { day: 'SEL', req: '680 REQ', pct: 70 },
    { day: 'RAB', req: '910 REQ', pct: 95 },
    { day: 'KAM', req: '540 REQ', pct: 58 },
  ];

  const tableData = [
    { source: 'github.com', count: 412, perc: '34.3%' },
    { source: 'linkedin.com', count: 289, perc: '24.1%' },
    { source: 'twitter.com', count: 156, perc: '13.0%' },
    { source: 'langsung', count: 343, perc: '28.6%' },
  ];

  return (
    <section className="flex-grow overflow-y-auto no-scrollbar p-edge-margin space-y-6 animate-fade-in">
      <div className="border border-border p-4 bg-surface relative overflow-hidden shimmer-overlay">
        <div className="flex justify-between items-start mb-2">
          <div className="font-code-sm text-code-sm text-primary opacity-70">NODE_ID: DATA_CORE_01</div>
          <div className="font-code-sm text-code-sm text-primary opacity-70">TAUTAN_AMAN: TERJALIN</div>
        </div>
        <div className="font-headline-lg text-headline-lg text-primary mb-1">ANALISIS_SISTEM</div>
        <p className="font-body-md text-body-md text-on-surface-variant">Metrik keterlibatan real-time dan data distribusi lalu lintas.</p>
        <div className="mt-4 flex gap-4">
          <div className="border border-primary/20 px-3 py-1 bg-primary-glow/5">
            <span className="font-label-md text-label-md text-primary">STATUS: </span>
            <span className="font-label-md text-label-md text-primary uppercase">Aktif</span>
          </div>
          <div className="border border-primary/20 px-3 py-1 bg-primary-glow/5">
            <span className="font-label-md text-label-md text-primary">WAKTU AKTIF: </span>
            <span className="font-label-md text-label-md text-primary">99.9%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border p-3 bg-surface hover:border-primary/50 transition-colors relative overflow-hidden shimmer-overlay">
          <div className="font-code-sm text-code-sm text-on-surface-variant mb-1">TOTAL_TRAFFIC</div>
          <div className="font-headline-md text-headline-md text-primary">1.2k <span className="text-xs opacity-50">REQ</span></div>
        </div>
        <div className="border border-border p-3 bg-surface hover:border-primary/50 transition-colors relative overflow-hidden shimmer-overlay">
          <div className="font-code-sm text-code-sm text-on-surface-variant mb-1">KONVERSI</div>
          <div className="font-headline-md text-headline-md text-primary">24.8%</div>
        </div>
        <div className="border border-border p-3 bg-surface hover:border-primary/50 transition-colors relative overflow-hidden shimmer-overlay">
          <div className="font-code-sm text-code-sm text-on-surface-variant mb-1">RATA_SESI</div>
          <div className="font-headline-md text-headline-md text-primary">02:45 <span className="text-xs opacity-50">M</span></div>
        </div>
        <div className="border border-border p-3 bg-surface hover:border-primary/50 transition-colors relative overflow-hidden shimmer-overlay">
          <div className="font-code-sm text-code-sm text-on-surface-variant mb-1">BEBAN_PUNCAK</div>
          <div className="font-headline-md text-headline-md text-primary">82% <span className="material-symbols-outlined text-xs align-middle">trending_up</span></div>
        </div>
      </div>

      <div className="border border-border bg-surface overflow-hidden shimmer-overlay">
        <div className="bg-surface-variant/30 px-3 py-1 border-b border-border flex justify-between items-center">
          <span className="font-label-md text-label-md text-primary">DISTRIBUSI_TRAFFIC_7H</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-error/40"></div>
            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {barData.map((b) => (
            <div key={b.day} className="space-y-1">
              <div className="flex justify-between font-code-sm text-code-sm mb-1">
                <span>{b.day}</span>
                <span className="text-primary">{b.req}</span>
              </div>
              <div className="h-4 bg-surface-container-low border border-outline-variant relative overflow-hidden">
                <div
                  className="h-full bg-primary opacity-80 transition-all duration-[1.5s] ease-out"
                  style={{ width: animateBars ? `${b.pct}%` : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-primary-glow/10 border-t border-border">
          <div className="font-code-sm text-code-sm text-primary animate-pulse">
            &gt; MEMINTA ANOMALI... TIDAK ADA YANG TERDETEKSI.
          </div>
        </div>
      </div>

      <div className="border border-border bg-surface">
        <div className="bg-surface-variant/30 px-3 py-1 border-b border-border">
          <span className="font-label-md text-label-md text-on-surface">METRIK_SUMBER</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-code-sm text-code-sm">
            <thead className="border-b border-border text-on-surface-variant">
              <tr>
                <th className="px-4 py-2 font-medium">SUMBER</th>
                <th className="px-4 py-2 font-medium">JUMLAH</th>
                <th className="px-4 py-2 font-medium">PERSEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-primary">
              {tableData.map((row) => (
                <tr key={row.source} className="hover:bg-primary-glow transition-colors">
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <td className="px-4 py-3">{row.perc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-border bg-[#000] p-3 font-code-sm text-code-sm leading-relaxed text-on-surface-variant">
        <div className="text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">history</span>
          <span>LOG_SISTEM</span>
        </div>
        <div className="opacity-80">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          <span className="text-primary">&gt; Diagnostik selesai. Tidak ada masalah ditemukan.</span>
          <span className="inline-block w-[6px] h-4 bg-primary align-middle ml-1 cursor-blink"></span>
        </div>
      </div>

      <div className="border border-border p-3 bg-surface flex items-center gap-3">
        <span className="text-primary font-bold">&gt;</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 font-body-md placeholder:text-text-muted placeholder:opacity-50"
          placeholder="clear / refresh / filter..."
          type="text"
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          onKeyDown={handleDataCommand}
        />
      </div>
    </section>
  );
}

const logTemplates = [
  { type: 'INFO', msg: 'User diarahkan ke /social/instagram.', color: 'text-primary' },
  { type: 'INFO', msg: 'Handshake tema: dark_mode tervalidasi.', color: 'text-primary' },
  { type: 'WARN', msg: 'Latensi tinggi terdeteksi pada CDN node-sgp.', color: 'text-tertiary-container' },
  { type: 'INFO', msg: 'Cache dibersihkan untuk system/manifest.', color: 'text-primary' },
  { type: 'INFO', msg: 'Koneksi baru dibuat: ID_4992.', color: 'text-primary' },
  { type: 'ERR', msg: 'Gagal sinkronisasi dengan penyedia analytics eksternal.', color: 'text-error' },
];

function LogsPage() {
  const initialLogs = [
    { ts: '2023-10-27 10:45:12', type: 'INFO', msg: 'Kernel diinisialisasi. Jembatan sistem terbentuk.', color: 'text-primary' },
    { ts: '2023-10-27 10:45:12', type: 'INFO', msg: 'Halaman dimuat sukses (244ms).', color: 'text-primary' },
    { ts: '2023-10-27 11:02:44', type: 'WARN', msg: 'Klik sosial berlebih terdeteksi (IP: 192.x.x.4). Pembatasan aktif.', color: 'text-tertiary-container' },
    { ts: '2023-10-27 11:15:02', type: 'INFO', msg: 'Manifest bio-link diperbarui via CLI jarak jauh.', color: 'text-primary' },
    { ts: '2023-10-27 11:45:21', type: 'ERR', msg: 'Jabat tangan gagal dengan penyedia analytics eksternal. Mencoba ulang...', color: 'text-error' },
    { ts: '2023-10-27 12:00:00', type: 'INFO', msg: 'Ringkasan harian dibuat. Performa optimal.', color: 'text-primary' },
  ];

  const [logEntries, setLogEntries] = useState(initialLogs);
  const [logInput, setLogInput] = useState('');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const ts = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const entry = logTemplates[Math.floor(Math.random() * logTemplates.length)];

      setLogEntries((prev) => {
        const next = [...prev, { ts, ...entry }];
        return next.length > 60 ? next.slice(-50) : next;
      });
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = document.getElementById('log-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logEntries]);

  const handleLogCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = logInput.trim().toLowerCase();
      if (cmd === 'clear') {
        setLogEntries([]);
      } else if (cmd === 'export') {
        const data = JSON.stringify(logEntries.slice(-10), null, 2);
        navigator.clipboard?.writeText(data);
        setLogEntries((prev) => [...prev, {
          ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
          type: 'INFO',
          msg: 'Log diekspor ke clipboard.',
          color: 'text-primary',
        }]);
      } else if (cmd.startsWith('filter ')) {
        const keyword = cmd.slice(7);
        setFilterText(keyword);
        setLogEntries((prev) => [...prev, {
          ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
          type: 'INFO',
          msg: `Filter diterapkan: "${keyword}"`,
          color: 'text-primary',
        }]);
      } else if (cmd === 'all') {
        setFilterText('');
        setLogEntries((prev) => [...prev, {
          ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
          type: 'INFO',
          msg: 'Filter dihapus. Menampilkan semua log.',
          color: 'text-primary',
        }]);
      } else {
        setLogEntries((prev) => [...prev, {
          ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
          type: 'ERR',
          msg: `Perintah '${cmd}' tidak dikenal. Coba: clear, export, filter <kata>, all`,
          color: 'text-error',
        }]);
      }
      setLogInput('');
    }
  };

  const displayLogs = filterText
    ? logEntries.filter((l) => l.msg.toLowerCase().includes(filterText.toLowerCase()) || l.type.toLowerCase().includes(filterText.toLowerCase()))
    : logEntries;

  return (
    <section className="flex-grow overflow-y-auto no-scrollbar p-edge-margin space-y-4 animate-fade-in">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <span className="font-label-md text-label-md">DIREKTORI: /VAR/LOG/SISTEM</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">Konsol Aktivitas</h2>
            <p className="font-code-sm text-code-sm text-text-muted">ID: NODE-771-LINK-BIO</p>
          </div>
          <div className="text-right">
            <span className="block font-code-sm text-code-sm text-primary">STATUS: PEMANTAUAN</span>
            <span className="block font-code-sm text-code-sm text-text-muted">WAKTU AKTIF: 142:31:09</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border p-3 bg-surface relative overflow-hidden shimmer-overlay">
          <p className="font-label-md text-label-md text-text-muted">TOTAL_PERMINTAAN</p>
          <p className="font-headline-lg text-headline-lg text-primary">12,842</p>
        </div>
        <div className="border border-border p-3 bg-surface relative overflow-hidden shimmer-overlay">
          <p className="font-label-md text-label-md text-text-muted">TINGKAT_ERROR</p>
          <p className="font-headline-lg text-headline-lg text-error">0.04%</p>
        </div>
      </div>

      <div className="flex-grow border border-border bg-surface flex flex-col min-h-[400px] shimmer-overlay">
        <div className="bg-surface-variant px-3 py-1.5 flex justify-between items-center border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error opacity-70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-secondary opacity-70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-70"></div>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant opacity-60">bash — 80x24</span>
        </div>

        <div
          id="log-container"
          className="flex-grow overflow-y-auto p-4 space-y-1 bg-surface-container-lowest font-body-md text-body-md"
          style={{ maxHeight: '400px' }}
        >
          {displayLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0">[{log.ts}]</span>
              <span className={`${log.color} flex-shrink-0`}>{log.type}:</span>
              <span className="text-on-surface">{log.msg}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-primary pt-2">
            <span>$ tail -f sys_logs</span>
            <span className="inline-block w-[6px] h-4 bg-primary align-middle cursor-blink"></span>
          </div>
        </div>
      </div>

      <div className="border border-border p-3 bg-surface flex items-center gap-3">
        <span className="text-primary font-bold">&gt;</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 font-body-md placeholder:text-text-muted placeholder:opacity-50"
          placeholder="clear / export / filter <kata> / all..."
          type="text"
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
          onKeyDown={handleLogCommand}
        />
      </div>

      {filterText && (
        <div className="font-code-sm text-code-sm text-primary bg-primary-glow/10 px-3 py-1 border border-primary/30">
          Filter aktif: "{filterText}" — <button className="underline cursor-pointer" onClick={() => { setFilterText(''); setLogEntries((prev) => [...prev, { ts: new Date().toISOString().slice(0, 19).replace('T', ' '), type: 'INFO', msg: 'Filter dihapus.', color: 'text-primary' }]); }}>hapus</button>
        </div>
      )}
    </section>
  );
}

function WelcomeBlock() {
  return (
    <div className="space-y-3">
      <div className="border border-primary/20 bg-primary-glow/5 p-3 space-y-1">
        <div className="flex items-center gap-2 text-primary font-headline-md">
          <span>╭──────────────────────────╮</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary font-headline-md">│</span>
          <span className="font-headline-md text-primary terminal-grow tracking-wider">CORE::SYS_LINK_BIO v2.0.6</span>
          <span className="text-primary font-headline-md">│</span>
        </div>
        <div className="flex items-center gap-2 text-primary font-headline-md">
          <span>╰──────────────────────────╯</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-code-sm text-code-sm">
        <div className="border border-border p-2 bg-surface">
          <span className="text-text-muted">STATUS: </span>
          <span className="text-primary">ONLINE</span>
        </div>
        <div className="border border-border p-2 bg-surface">
          <span className="text-text-muted">SESSION: </span>
          <span className="text-primary">#A7F3B2</span>
        </div>
        <div className="border border-border p-2 bg-surface">
          <span className="text-text-muted">NODE: </span>
          <span className="text-primary">BIO-LINK-01</span>
        </div>
        <div className="border border-border p-2 bg-surface">
          <span className="text-text-muted">PROTOKOL: </span>
          <span className="text-primary">v2.0.6</span>
        </div>
      </div>

      <div className="border-t border-border/30 my-1"></div>

      <p className="font-headline-md text-headline-md text-primary terminal-glow">Selamat datang di Core-Terminal v2.0.6</p>
      <p className="font-body-md text-body-md text-text-main">Status: Online | Target: Full-Stack Developer Journey</p>
      <div className="border border-border/50 bg-surface p-3 space-y-1">
        <p className="font-body-md text-body-md text-text-main">Coba ketik salah satu perintah di bawah:</p>
        <p className="font-code-sm text-code-sm text-primary">  about     — Lihat profil saya</p>
        <p className="font-code-sm text-code-sm text-primary">  projects  — Lihat proyek saya</p>
        <p className="font-code-sm text-code-sm text-primary">  socials   — Lihat media sosial saya</p>
        <p className="font-code-sm text-code-sm text-text-muted">  atau ketik <span className="text-primary">help</span> untuk semua perintah</p>
      </div>
    </div>
  );
}

function EntropyBlock() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  const bars = [
    { label: 'CPU', pct: 32 },
    { label: 'MEM', pct: 58 },
    { label: 'NET', pct: 21 },
    { label: 'DISK', pct: 74 },
  ];

  return (
    <div className="space-y-3 py-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="font-code-sm text-text-muted uppercase tracking-wider">Entropi Sistem</p>
        <span className="font-code-sm text-code-sm text-primary animate-pulse">● LANGSUNG</span>
      </div>
      <div className="border border-border divide-y divide-border">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center px-3 py-2 hover:bg-primary-glow/5 transition-colors">
            <span className="font-code-sm text-code-sm text-text-muted w-10">{b.label}</span>
            <div className="flex-1 h-4 bg-surface-container-low border border-outline-variant relative overflow-hidden mx-2">
              <div
                className="h-full bg-primary opacity-80 transition-all duration-[1.2s] ease-out"
                style={{ width: animate ? `${b.pct}%` : '0%' }}
              ></div>
            </div>
            <span className="font-code-sm text-code-sm text-primary w-8 text-right">{b.pct}%</span>
            <div className="w-2 h-2 rounded-full ml-2 bg-primary/40 animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 font-code-sm text-code-sm text-text-muted">
        <span>UPTIME: 142:31:09</span>
        <span>|</span>
        <span>PRGS: 04</span>
        <span>|</span>
        <span className="text-primary">TEMP: 42°C</span>
      </div>
    </div>
  );
}

function AboutBlock() {
  const data = loadData();
  return (
    <div className="p-3 border-l-2 border-primary-glow bg-surface-container-lowest">
      <p className="font-body-md text-body-md text-text-main leading-relaxed">
        {data.about}
      </p>
    </div>
  );
}

function ProjectsBlock() {
  const data = loadData();

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.projects.map((p) => (
        <a
          key={p.num}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="border border-border p-3 hover:border-primary transition-colors cursor-pointer group block"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-md text-label-md text-primary uppercase">[{p.num}]</span>
            <span className="material-symbols-outlined text-primary text-sm">open_in_new</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-text-main group-hover:text-primary mb-2">{p.title}</h3>
          <div className="flex flex-wrap gap-1">
            {p.tags.map((t) => (
              <span key={t} className="font-code-sm text-code-sm border border-outline px-1 text-on-surface-variant">{t}</span>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}

function SocialsBlock() {
  const data = loadData();
  return (
    <div className="flex flex-wrap gap-2">
      {data.socials.map((l) => (
        <a key={l.abbr} className="flex items-center space-x-2 px-3 py-2 border border-primary text-primary hover:bg-primary-glow transition-all active:scale-95 cursor-pointer" href={l.url} target="_blank" rel="noreferrer">
          <span className="font-code-sm text-code-sm uppercase">[{l.abbr}]</span>
          <span className="font-body-md">{l.label}</span>
        </a>
      ))}
    </div>
  );
}

function ChatFloating() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 340 : 780,
    y: typeof window !== 'undefined' ? window.innerHeight - 480 : 520,
  }));
  const dragRef = useRef({ active: false, ox: 0, oy: 0 });
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya asisten AI portofolio. Tanyakan tentang teknologi, proyek, atau pengalaman yang saya miliki.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const localApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

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
      let res;
      if (localApiKey) {
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localApiKey}`,
          },
          body: JSON.stringify({
            model: 'openrouter/auto',
            messages: [
              {
                role: 'system',
                content: 'Kamu adalah asisten AI untuk portofolio Mikhel Febian, mahasiswa Sistem Informasi semester 2 di Universitas Mulawarman yang tertarik dengan bisnis, web, teknologi, dan AI. Jawab pertanyaan tentang teknologi, proyek, dan skill dengan ramah dan alami. Konteks: Mikhel Febian, pemilik portofolio ini. Teknologi: React, Tailwind, MySQL, Rust, Web3, Three.js, Go, Docker. Proyek: Blood Donor System (React/Tailwind/MySQL), Crypto Sentinel (Rust/Web3), Neural Net UI (Three.js/AI), API Vault (Go/Docker). Jawab dalam bahasa Indonesia yang santai dan mudah dipahami. JANGAN gunakan karakter markdown seperti *, _, `, #, atau format tebal/miring. Gunakan teks biasa saja agar mudah dibaca.',
              },
              ...context,
            ],
          }),
        });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: context }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Kosong atau diblokir.');
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
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
      className="fixed top-1/2 -translate-y-1/2 right-4 z-50 w-12 h-12 rounded-full bg-primary text-background shadow-lg hover:shadow-[0_0_20px_rgba(78,222,163,0.5)] transition-all duration-300 cursor-pointer active:scale-90 flex items-center justify-center hover:scale-110"
      style={open ? { display: 'none' } : undefined}
    >
      <span className="material-symbols-outlined text-2xl">smart_toy</span>
    </button>
  );

  if (!open) return bubble;

  return (
    <>
      <div
        className="fixed z-50 bg-surface border border-border shadow-2xl flex flex-col overflow-hidden"
        style={isMobile
          ? { left: 8, top: 8, width: 'calc(100vw - 16px)', height: 'calc(100dvh - 16px)' }
          : { left: pos.x, top: pos.y, width: 320, height: 400 }
        }
      >
        <div
          className="bg-surface-dim border-b border-outline-variant px-3 py-2 flex items-center justify-between flex-shrink-0 cursor-move select-none"
          onMouseDown={startDrag}
          onTouchStart={(e) => startDrag(e.touches[0])}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
            <span className="font-headline-md text-headline-md text-primary">AI ASISTEN</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-text-muted hover:text-primary cursor-pointer active:opacity-80"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2.5 border ${
                    msg.role === 'user'
                      ? 'bg-primary-glow/10 border-primary/30'
                      : 'bg-surface-container-lowest border-border'
                  }`}>
                    <div className="font-code-sm text-code-sm text-text-muted mb-0.5">
                      {msg.role === 'user' ? 'visitor@guest' : 'ai@assistant'}:
                    </div>
                    <div className={`font-body-md text-body-md whitespace-pre-wrap ${
                      msg.role === 'user' ? 'text-primary' : 'text-text-main'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="border border-border p-2.5 bg-surface-container-lowest">
                    <div className="flex items-center gap-1.5 font-body-md text-body-md text-primary">
                      <span>Mengetik</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-outline-variant bg-surface-dim px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold font-body-md text-sm">{'>'}</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 font-body-md text-body-md placeholder:text-text-muted placeholder:opacity-50"
                  placeholder="Ketik pertanyaan..."
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !chatInput.trim()}
                  className="text-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:opacity-80"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </div>
          </div>
        </div>
    </>
  );
}

function AdminPage({ onClose }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState(loadData());
  const [about, setAbout] = useState(data.about);
  const [projects, setProjects] = useState(data.projects);
  const [socials, setSocials] = useState(data.socials);
  const [np, setNp] = useState({ num: '', title: '', tags: '', url: '' });
  const [ns, setNs] = useState({ label: '', url: '', abbr: '' });
  const [saved, setSaved] = useState(false);
  const [editProj, setEditProj] = useState(-1);
  const [editSoc, setEditSoc] = useState(-1);

  const handleSave = () => {
    const payload = { about, projects, socials };
    saveData(payload);
    setData(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const upsertProject = () => {
    if (!np.title.trim()) return;
    const item = {
      num: np.num || String(projects.length + 1).padStart(2, '0'),
      title: np.title,
      tags: np.tags.split(',').map((t) => t.trim()).filter(Boolean),
      url: np.url || '#',
    };
    if (editProj >= 0) {
      const next = [...projects];
      next[editProj] = item;
      setProjects(next);
      setEditProj(-1);
    } else {
      setProjects([...projects, item]);
    }
    setNp({ num: '', title: '', tags: '', url: '' });
  };

  const editProject = (idx) => {
    const p = projects[idx];
    setNp({ num: p.num, title: p.title, tags: p.tags.join(', '), url: p.url });
    setEditProj(idx);
  };

  const cancelEditProject = () => {
    setEditProj(-1);
    setNp({ num: '', title: '', tags: '', url: '' });
  };

  const delProject = (idx) => setProjects(projects.filter((_, i) => i !== idx));

  const upsertSocial = () => {
    if (!ns.label.trim() || !ns.abbr.trim()) return;
    const item = { label: ns.label, url: ns.url || '#', abbr: ns.abbr };
    if (editSoc >= 0) {
      const next = [...socials];
      next[editSoc] = item;
      setSocials(next);
      setEditSoc(-1);
    } else {
      setSocials([...socials, item]);
    }
    setNs({ label: '', url: '', abbr: '' });
  };

  const editSocial = (idx) => {
    const s = socials[idx];
    setNs({ label: s.label, url: s.url, abbr: s.abbr });
    setEditSoc(idx);
  };

  const cancelEditSocial = () => {
    setEditSoc(-1);
    setNs({ label: '', url: '', abbr: '' });
  };

  const delSocial = (idx) => setSocials(socials.filter((_, i) => i !== idx));

  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setErr(''); }
    else setErr('Password salah.');
  };

  if (!authed) {
    return (
      <section className="flex-grow overflow-y-auto no-scrollbar p-edge-margin animate-fade-in flex items-center justify-center relative">
        <div className="border border-border p-6 bg-surface w-full max-w-sm space-y-4 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-text-muted cursor-pointer hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="text-center space-y-1">
            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
            <p className="font-headline-md text-headline-md text-primary">ADMIN ACCESS</p>
          </div>
          <input
            className="w-full bg-surface-dim border border-outline-variant px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary"
            placeholder="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {err && <p className="font-code-sm text-code-sm text-error">{err}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-background font-bold font-body-md py-2 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          >
            MASUK
          </button>
        </div>
      </section>
    );
  }

  const inputClass = 'w-full bg-surface-dim border border-outline-variant px-3 py-1.5 font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary';

  return (
    <section className="flex-grow overflow-y-auto no-scrollbar p-edge-margin space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-headline-lg text-headline-lg text-primary">PANEL ADMIN</p>
          <p className="font-code-sm text-code-sm text-text-muted">Kelola data portofolio</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-text-muted cursor-pointer hover:text-on-surface transition-colors"
            title="Tutup admin (ketik 'logout')"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-background font-bold font-body-md px-4 py-2 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {saved ? 'TERSIMPAN' : 'SIMPAN'}
          </button>
        </div>
      </div>

      <div className="border border-border bg-surface p-4 space-y-2">
        <p className="font-label-md text-label-md text-primary uppercase">TENTANG / BIO</p>
        <textarea
          className={`${inputClass} min-h-[100px] resize-y`}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
      </div>

      <div className="border border-border bg-surface p-4 space-y-3">
        <p className="font-label-md text-label-md text-primary uppercase">PROYEK</p>
        <div className="space-y-2">
          {projects.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface-dim px-3 py-2 border border-outline-variant">
              <span className="font-code-sm text-code-sm text-primary font-bold w-8">[{p.num}]</span>
              <span className="flex-1 font-body-md text-body-md text-on-surface truncate">{p.title}</span>
              <button onClick={() => editProject(i)} className="text-primary cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button onClick={() => delProject(i)} className="text-error cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
        <p className="font-code-sm text-code-sm text-text-muted">{editProj >= 0 ? 'Edit proyek:' : 'Tambah proyek baru:'}</p>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputClass} placeholder="No (otomatis)" value={np.num} onChange={(e) => setNp({ ...np, num: e.target.value })} />
          <input className={inputClass} placeholder="URL" value={np.url} onChange={(e) => setNp({ ...np, url: e.target.value })} />
          <input className={`${inputClass} col-span-2`} placeholder="Judul" value={np.title} onChange={(e) => setNp({ ...np, title: e.target.value })} />
          <input className={`${inputClass} col-span-2`} placeholder="Tag (pisahkan dengan koma)" value={np.tags} onChange={(e) => setNp({ ...np, tags: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button onClick={upsertProject} className="flex-1 border border-primary bg-primary text-background font-body-md py-2 cursor-pointer hover:opacity-90 transition-all">
            {editProj >= 0 ? 'SIMPAN PERUBAHAN' : '+ TAMBAH PROYEK'}
          </button>
          {editProj >= 0 && (
            <button onClick={cancelEditProject} className="border border-outline-variant text-text-muted font-body-md px-4 py-2 cursor-pointer hover:opacity-80 transition-all">
              BATAL
            </button>
          )}
        </div>
      </div>

      <div className="border border-border bg-surface p-4 space-y-3">
        <p className="font-label-md text-label-md text-primary uppercase">SOSIAL MEDIA</p>
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface-dim px-3 py-2 border border-outline-variant">
              <span className="font-code-sm text-code-sm text-primary font-bold w-8">[{s.abbr}]</span>
              <span className="flex-1 font-body-md text-body-md text-on-surface truncate">{s.label}</span>
              <button onClick={() => editSocial(i)} className="text-primary cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button onClick={() => delSocial(i)} className="text-error cursor-pointer hover:opacity-80">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
        <p className="font-code-sm text-code-sm text-text-muted">{editSoc >= 0 ? 'Edit sosial media:' : 'Tambah sosial media baru:'}</p>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputClass} placeholder="Label (Instagram)" value={ns.label} onChange={(e) => setNs({ ...ns, label: e.target.value })} />
          <input className={inputClass} placeholder="Singkatan (ig)" value={ns.abbr} onChange={(e) => setNs({ ...ns, abbr: e.target.value })} />
          <input className={`${inputClass} col-span-2`} placeholder="URL" value={ns.url} onChange={(e) => setNs({ ...ns, url: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button onClick={upsertSocial} className="flex-1 border border-primary bg-primary text-background font-body-md py-2 cursor-pointer hover:opacity-90 transition-all">
            {editSoc >= 0 ? 'SIMPAN PERUBAHAN' : '+ TAMBAH SOSIAL'}
          </button>
          {editSoc >= 0 && (
            <button onClick={cancelEditSocial} className="border border-outline-variant text-text-muted font-body-md px-4 py-2 cursor-pointer hover:opacity-80 transition-all">
              BATAL
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default App;

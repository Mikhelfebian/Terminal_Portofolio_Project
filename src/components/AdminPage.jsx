import { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { uploadImage } from '../supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

const TAB_FIELDS = {
  home: ['name', 'bio', 'hero_description', 'hero_photo', 'github_username'],
  about: ['about_title', 'about_text', 'about_photo'],
  skills: ['skills'],
  journey: ['projects'],
  socials: ['socials'],
};

export function AdminPage({ onClose }) {
  const { portfolioData, savePortfolioData, addLog } = usePortfolio();
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState(null);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const [data, setData] = useState({
    name: '', bio: '', hero_description: '', about_title: '', about_text: '', hero_photo: '', about_photo: '',
    github_username: '', projects: [], skills: [], socials: []
  });

  useEffect(() => {
    if (portfolioData) setData(portfolioData); // eslint-disable-line react-hooks/set-state-in-effect
  }, [portfolioData]);

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    addLog('INFO', `Mengunggah ${field}...`, 'text-primary');
    const url = await uploadImage(file);
    if (url) {
      setData(prev => ({ ...prev, [field]: url }));
      addLog('INFO', `${field} berhasil diunggah.`, 'text-primary');
    } else {
      addLog('ERR', `Gagal mengunggah ${field}. Cek konsol untuk detail.`, 'text-error');
    }
    setLoading(false);
  };

  const saveViaApi = async (payload) => {
    const res = await fetch(`${API_BASE}/api/portfolio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  // Simpan hanya field dari tab aktif
  const handleSaveTab = async () => {
    setLoading(true);
    setSaveStatus(null);
    const fields = TAB_FIELDS[activeTab];
    const tabData = {};
    fields.forEach(f => { tabData[f] = data[f]; });
    const merged = { ...portfolioData, ...tabData };
    const result = await saveViaApi(merged);
    if (result?.success) {
        addLog('INFO', `Tab ${activeTab.toUpperCase()} disimpan.`, 'text-primary');
        setSaveStatus({ type: 'success', msg: `${activeTab.toUpperCase()} berhasil disimpan!` });
        savePortfolioData(result.data);
    } else {
        const errMsg = result?.error || 'Gagal menyimpan ke database.';
        addLog('ERR', errMsg, 'text-error');
        setSaveStatus({ type: 'error', msg: errMsg });
    }
    setLoading(false);
  };

  // Simpan semua field
  const handleSaveAll = async () => {
    setLoading(true);
    setSaveStatus(null);
    const result = await saveViaApi(data);
    if (result?.success) {
        addLog('INFO', 'Semua data disimpan.', 'text-primary');
        setSaveStatus({ type: 'success', msg: 'Semua data berhasil disimpan!' });
        savePortfolioData(result.data);
    } else {
        const errMsg = result?.error || 'Gagal menyimpan ke database.';
        addLog('ERR', errMsg, 'text-error');
        setSaveStatus({ type: 'error', msg: errMsg });
    }
    setLoading(false);
  };

  const addArrayItem = (field, template) => {
    setData({...data, [field]: [...(data[field] || []), {...template}]});
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...data[field]];
    newArray.splice(index, 1);
    setData({...data, [field]: newArray});
  };

  const updateArray = (field, index, key, value) => {
    const newArray = [...data[field]];
    newArray[index][key] = value;
    setData({...data, [field]: newArray});
  };

  const handleLogin = async () => {
    if (!pass) { addLog('ERR', 'Masukkan password'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthed(true);
        addLog('INFO', 'Login berhasil', 'text-primary');
      } else {
        addLog('ERR', data.error || 'Password Salah');
      }
    } catch {
      addLog('ERR', 'Gagal terhubung ke server');
    }
  };

  if (!authed) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <div className="p-8 border border-border w-full max-w-sm space-y-4">
          <input type="password" placeholder="Password Admin" className="w-full p-3 bg-surface-dim border border-border text-on-surface" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full p-3 bg-primary text-background font-bold cursor-pointer">LOGIN</button>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full p-3 bg-surface-dim border border-border text-sm text-on-surface placeholder:text-on-surface-variant/40';

  return (
    <div className="h-full flex flex-col bg-surface p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-primary">ADMIN DASHBOARD</h2>
        <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-text-muted hover:text-white cursor-pointer">CLOSE</button>
            <button onClick={handleSaveAll} disabled={loading} className="px-4 py-2 bg-primary text-background font-bold cursor-pointer">{loading ? '...' : 'SIMPAN SEMUA'}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto flex-shrink-0">
        {['home', 'about', 'skills', 'journey', 'socials'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 cursor-pointer whitespace-nowrap text-sm uppercase tracking-wider ${activeTab === tab ? 'bg-primary text-background font-bold' : 'bg-surface-dim text-on-surface-variant hover:text-primary'}`}>{tab}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {/* HOME / HERO */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h3 className="text-primary font-bold text-sm uppercase tracking-widest">Hero / Home Section</h3>
            <input className={inputClass} value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} placeholder="Nama Lengkap"/>
            <input className={inputClass} value={data.bio || ''} onChange={e => setData({...data, bio: e.target.value})} placeholder="Bio Singkat"/>
            <textarea className={inputClass} rows="3" value={data.hero_description || ''} onChange={e => setData({...data, hero_description: e.target.value})} placeholder="Deskripsi Hero (teks di bawah bio)"/>
            <input className={inputClass} value={data.github_username || ''} onChange={e => setData({...data, github_username: e.target.value})} placeholder="Username GitHub"/>
            <div className="border border-dashed border-border p-4">
              <p className="text-xs text-on-surface-variant mb-2">Foto Hero</p>
              <input type="file" accept="image/*" onChange={e => handleUpload(e, 'hero_photo')} className="text-sm text-on-surface-variant"/>
              <input className="mt-2 w-full p-2 bg-surface-dim border border-border text-sm text-on-surface placeholder:text-on-surface-variant/40" value={data.hero_photo || ''} onChange={e => setData({...data, hero_photo: e.target.value})} placeholder="Atau tempel URL gambar langsung..."/>
              {data.hero_photo && (
                <div className="mt-2 relative inline-block">
                  <img src={data.hero_photo} className="w-24 h-18 object-cover border border-border" alt="Hero"/>
                  <button onClick={() => setData({...data, hero_photo: ''})} className="absolute -top-2 -right-2 bg-error text-white text-xs w-5 h-5 rounded-full cursor-pointer">×</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-primary font-bold text-sm uppercase tracking-widest">About Section</h3>
            <input className={inputClass} value={data.about_title || ''} onChange={e => setData({...data, about_title: e.target.value})} placeholder="Judul About (contoh: Navigasi Logika Digital.)"/>
            <textarea className={inputClass} rows="5" value={data.about_text || ''} onChange={e => setData({...data, about_text: e.target.value})} placeholder="Deskripsi About (gunakan Enter untuk paragraf baru)"/>
            <div className="border border-dashed border-border p-4">
              <p className="text-xs text-on-surface-variant mb-2">Foto About</p>
              <input type="file" accept="image/*" onChange={e => handleUpload(e, 'about_photo')} className="text-sm text-on-surface-variant"/>
              <input className="mt-2 w-full p-2 bg-surface-dim border border-border text-sm text-on-surface placeholder:text-on-surface-variant/40" value={data.about_photo || ''} onChange={e => setData({...data, about_photo: e.target.value})} placeholder="Atau tempel URL gambar langsung..."/>
              {data.about_photo && (
                <div className="mt-2 relative inline-block">
                  <img src={data.about_photo} className="w-24 h-18 object-cover border border-border" alt="About"/>
                  <button onClick={() => setData({...data, about_photo: ''})} className="absolute -top-2 -right-2 bg-error text-white text-xs w-5 h-5 rounded-full cursor-pointer">×</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-primary font-bold text-sm uppercase tracking-widest">Skills / Keahlian</h3>
              <button onClick={() => addArrayItem('skills', { name: '', desc: '', icon: 'code' })} className="text-xs bg-primary text-background px-3 py-1.5 font-bold cursor-pointer hover:opacity-90">+ TAMBAH SKILL</button>
            </div>
            {(!data.skills || data.skills.length === 0) && (
              <p className="text-on-surface-variant text-sm italic">Belum ada skill. Klik "TAMBAH SKILL" untuk mulai.</p>
            )}
            {data.skills?.map((skill, i) => (
              <div key={i} className="p-3 border border-border bg-surface-dim space-y-2 relative">
                <button onClick={() => removeArrayItem('skills', i)} className="absolute top-2 right-2 text-error text-xs hover:opacity-80 cursor-pointer">HAPUS</button>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-on-surface-variant">Nama Skill</label>
                    <input className={inputClass} value={skill.name || ''} onChange={e => updateArray('skills', i, 'name', e.target.value)} placeholder="Frontend & Web"/>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant">Icon (Material)</label>
                    <input className={inputClass} value={skill.icon || 'code'} onChange={e => updateArray('skills', i, 'icon', e.target.value)} placeholder="html, database, dll"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant">Deskripsi</label>
                  <textarea className={inputClass} rows="2" value={skill.desc || ''} onChange={e => updateArray('skills', i, 'desc', e.target.value)} placeholder="Deskripsi keahlian..."/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS (JOURNEY) */}
        {activeTab === 'journey' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-primary font-bold text-sm uppercase tracking-widest">Projects / Proyek</h3>
              <button onClick={() => addArrayItem('projects', { num: '', title: '', tags: [], url: '#', photo: '', description: '' })} className="text-xs bg-primary text-background px-3 py-1.5 font-bold cursor-pointer hover:opacity-90">+ TAMBAH PROYEK</button>
            </div>
            {(!data.projects || data.projects.length === 0) && (
              <p className="text-on-surface-variant text-sm italic">Belum ada proyek. Klik "TAMBAH PROYEK" untuk mulai.</p>
            )}
            {data.projects?.map((proj, i) => (
              <div key={i} className="p-3 border border-border bg-surface-dim space-y-2 relative">
                <button onClick={() => removeArrayItem('projects', i)} className="absolute top-2 right-2 text-error text-xs hover:opacity-80 cursor-pointer">HAPUS</button>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-on-surface-variant">Nomor Urut</label>
                    <input className={inputClass} value={proj.num || ''} onChange={e => updateArray('projects', i, 'num', e.target.value)} placeholder="01"/>
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-on-surface-variant">Judul Proyek</label>
                    <input className={inputClass} value={proj.title || ''} onChange={e => updateArray('projects', i, 'title', e.target.value)} placeholder="Nama Proyek"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant">URL / Link</label>
                  <input className={inputClass} value={proj.url || ''} onChange={e => updateArray('projects', i, 'url', e.target.value)} placeholder="https://..."/>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant">Deskripsi</label>
                  <textarea className={inputClass} rows="2" value={proj.description || ''} onChange={e => updateArray('projects', i, 'description', e.target.value)} placeholder="Deskripsi proyek..."/>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant">Tags (pisahkan dengan koma)</label>
                  <input className={inputClass} value={(proj.tags || []).join(', ')} onChange={e => updateArray('projects', i, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="REACT, TAILWIND, MYSQL"/>
                </div>
                <div className="border border-dashed border-border p-2">
                  <p className="text-xs text-on-surface-variant mb-1">Foto Proyek (opsional)</p>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setLoading(true);
                    addLog('INFO', 'Mengunggah foto proyek...', 'text-primary');
                    const url = await uploadImage(file);
                    if (url) {
                      updateArray('projects', i, 'photo', url);
                      addLog('INFO', 'Foto proyek berhasil diunggah.', 'text-primary');
                    } else {
                      addLog('ERR', 'Gagal mengunggah foto proyek.', 'text-error');
                    }
                    setLoading(false);
                  }} className="text-xs text-on-surface-variant"/>
                  <input className="mt-1 w-full p-2 bg-surface-dim border border-border text-sm text-on-surface placeholder:text-on-surface-variant/40" value={proj.photo || ''} onChange={e => updateArray('projects', i, 'photo', e.target.value)} placeholder="Atau tempel URL gambar langsung..."/>
                  {proj.photo && (
                    <div className="mt-1 relative inline-block">
                      <img src={proj.photo} className="w-16 h-12 object-cover border border-border" alt="Project"/>
                      <button onClick={() => updateArray('projects', i, 'photo', '')} className="absolute -top-2 -right-2 bg-error text-white text-xs w-4 h-4 rounded-full cursor-pointer flex items-center justify-center">×</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOCIALS */}
        {activeTab === 'socials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-primary font-bold text-sm uppercase tracking-widest">Social Media Links</h3>
              <button onClick={() => addArrayItem('socials', { label: '', url: '', abbr: '' })} className="text-xs bg-primary text-background px-3 py-1.5 font-bold cursor-pointer hover:opacity-90">+ TAMBAH SOSMED</button>
            </div>
            {(!data.socials || data.socials.length === 0) && (
              <p className="text-on-surface-variant text-sm italic">Belum ada social media. Klik "TAMBAH SOSMED" untuk mulai.</p>
            )}
            {data.socials?.map((social, i) => (
              <div key={i} className="p-3 border border-border bg-surface-dim space-y-2 relative">
                <button onClick={() => removeArrayItem('socials', i)} className="absolute top-2 right-2 text-error text-xs hover:opacity-80 cursor-pointer">HAPUS</button>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-on-surface-variant">Label</label>
                    <input className={inputClass} value={social.label || ''} onChange={e => updateArray('socials', i, 'label', e.target.value)} placeholder="Instagram"/>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant">Singkatan (abbr)</label>
                    <input className={inputClass} value={social.abbr || ''} onChange={e => updateArray('socials', i, 'abbr', e.target.value)} placeholder="ig"/>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant">URL</label>
                    <input className={inputClass} value={social.url || ''} onChange={e => updateArray('socials', i, 'url', e.target.value)} placeholder="https://instagram.com/..."/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status notifikasi simpan */}
      {saveStatus && (
        <div className={`flex-shrink-0 px-4 py-3 text-sm font-bold border ${saveStatus.type === 'success' ? 'bg-success-green/10 border-success-green/30 text-success-green' : 'bg-error/10 border-error/30 text-error'}`}>
          {saveStatus.msg}
        </div>
      )}

      {/* Tombol Simpan per Tab (bawah) */}
      <div className="flex-shrink-0 pt-4 border-t border-border mt-4">
        <button onClick={handleSaveTab} disabled={loading} className="w-full py-4 bg-primary/90 hover:bg-primary text-background font-bold text-sm uppercase tracking-widest cursor-pointer transition-opacity">
          {loading ? 'MENYIMPAN KE DATABASE...' : `SIMPAN ${activeTab.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}

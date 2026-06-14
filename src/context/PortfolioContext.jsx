import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPortfolio, savePortfolio as apiSavePortfolio } from '../supabase.js';
import { fetchGitHubStats } from '../services/github.js';

const PortfolioContext = createContext(null);

const STORAGE_KEY = 'bio_portfolio_data';
const DEFAULT_USERNAME = 'mikhel-febian';

const defaultData = {
  name: 'Mikhel Febian',
  bio: 'Mahasiswa Sistem Informasi | Web & Database Enthusiast',
  hero_description: 'Saya adalah seorang mahasiswa yang antusias dalam dunia teknologi, selalu ingin belajar hal baru dan memecahkan masalah kompleks menjadi solusi sederhana.',
  about_title: 'Navigasi Logika Digital.',
  about_text: 'Saya saat ini sedang menempuh perkuliahan di semester 2 program studi Sistem Informasi. Dunia teknologi selalu memikat saya dengan teka-teki logika, di mana proses pemecahan masalah dan debugging berjam-jam memberikan kepuasan tersendiri. Di luar kurikulum perkuliahan, saya aktif menguji coba lingkungan Linux, merancang tata kelola database relasional, serta mendalami bagaimana jaringan protokol web terintegrasi dari hulu ke hilir.',
  github_username: 'mikhelfebian',
  hero_photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA--g7F-QoWB7ZPbMnNgcYpD2zYg0QfBSJNI7gcfZxo_kxhrKGiIT1ZRMPwkFhQg_J1X8xyflR_s1PV5KYLfjzj1pmSFJAHPHqw2Vl2Du_aQkGPJm0FYLM9xdvH7VYSyu03R4zy88Wwa6rJB0mwPXrPrUGh6PIRLc3NsOmtMkK_uTasn_4XY_WDq7JFZQRnG4LwAfVEJ_qg5yT6ZCW-I6OVdz2gLHMA25JK9h54PTmiAhN3oy1zvYGURaFjoRe-iUWb7uXLiZnLfi4w',
  about_photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA--g7F-QoWB7ZPbMnNgcYpD2zYg0QfBSJNI7gcfZxo_kxhrKGiIT1ZRMPwkFhQg_J1X8xyflR_s1PV5KYLfjzj1pmSFJAHPHqw2Vl2Du_aQkGPJm0FYLM9xdvH7VYSyu03R4zy88Wwa6rJB0mwPXrPrUGh6PIRLc3NsOmtMkK_uTasn_4XY_WDq7JFZQRnG4LwAfVEJ_qg5yT6ZCW-I6OVdz2gLHMA25JK9h54PTmiAhN3oy1zvYGURaFjoRe-iUWb7uXLiZnLfi4w',
  projects: [
    { num: '01', title: 'Blood Donor System', tags: ['REACT', 'TAILWIND', 'MYSQL'], url: '#', photo: '', description: 'Sistem manajemen donor darah berbasis web dengan fitur registrasi, jadwal, dan laporan.' },
    { num: '02', title: 'Crypto Sentinel', tags: ['RUST', 'WEB3'], url: '#', photo: '', description: 'Tool monitoring keamanan untuk smart contract dan transaksi blockchain.' },
  ],
  skills: [
    { name: 'Frontend & Web', desc: 'HTML5, CSS3, ES6 JavaScript, React, Tailwind CSS 4.', icon: 'html' },
    { name: 'Databases', desc: 'MySQL, MariaDB, Perancangan ERD, Supabase SDK.', icon: 'database' },
    { name: 'Sistem & OS', desc: 'Linux (Ubuntu/Debian), Bash Shell Scripting, CLI Automation.', icon: 'terminal' },
    { name: 'Tools', desc: 'VS Code, Git, GitHub Version Control, XAMPP, Docker (Exploring).', icon: 'build' },
  ],
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/mikhel_febian', abbr: 'ig' },
    { label: 'GitHub', url: 'https://github.com/mikhelfebian', abbr: 'gh' },
  ],
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState(defaultData);
  const [githubStats, setGithubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appLogs, setAppLogs] = useState([]);

  const addLog = useCallback((type, msg, color = 'text-primary') => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAppLogs((prev) => [...prev.slice(-99), { ts, type, msg, color }]);
  }, []);

  const loadInitialData = useCallback(async () => {
    addLog('INFO', 'Memuat data portofolio...', 'text-primary');
    try {
      const result = await fetchPortfolio();
      if (result && !result.error) {
        const mergedData = { ...defaultData, ...result };
        setPortfolioData(mergedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
        addLog('INFO', 'Data cloud dimuat.', 'text-primary');
        return mergedData;
      }
      if (result?.error) {
        addLog('ERR', `Supabase: ${result.error}`, 'text-error');
      }
    } catch (err) {
      addLog('ERR', `Koneksi Supabase gagal: ${err.message}`, 'text-error');
    }
    // Fallback ke localStorage jika Supabase gagal
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        const mergedLocal = { ...defaultData, ...parsed };
        setPortfolioData(mergedLocal);
        addLog('INFO', 'Data lokal (cache) dimuat.', 'text-primary');
        return mergedLocal;
      }
    } catch (e) {
      addLog('ERR', `Gagal baca cache lokal: ${e.message}`, 'text-error');
    }
    return defaultData;
  }, [addLog]);

  const loadGitHubData = useCallback(async (username) => {
    if (!username) return;
    try {
      const stats = await fetchGitHubStats(username);
      if (stats) setGithubStats(stats);
    } catch {
      addLog('ERR', 'Gagal memuat statistik GitHub.', 'text-error');
    }
  }, [addLog]);

  const savePortfolioData = useCallback(async (updatedData) => {
    setPortfolioData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    addLog('INFO', 'Menyimpan perubahan...', 'text-primary');
    try {
      const result = await apiSavePortfolio(updatedData);
      if (result.error) {
        addLog('ERR', `Gagal simpan: ${result.error}`, 'text-error');
        return { error: result.error };
      }
      addLog('INFO', 'Data cloud diperbarui.', 'text-primary');
      if (updatedData.github_username !== portfolioData.github_username) {
        loadGitHubData(updatedData.github_username);
      }
      return { success: true };
    } catch (err) {
      addLog('ERR', `Gagal menyimpan: ${err.message}`, 'text-error');
      return { error: err.message };
    }
  }, [portfolioData.github_username, loadGitHubData, addLog]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await loadInitialData();
      await loadGitHubData(data.github_username || DEFAULT_USERNAME);
      setLoading(false);
    };
    init();
  }, [loadInitialData, loadGitHubData]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolioData,
        githubStats,
        loading,
        appLogs,
        addLog,
        savePortfolioData,
        refreshGitHub: () => loadGitHubData(portfolioData.github_username),
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio harus digunakan di dalam PortfolioProvider');
  return context;
};

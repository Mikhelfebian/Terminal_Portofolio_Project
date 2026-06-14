import { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { fetchGitHubStats } from '../services/github';

export function GitHubDashboard() {
  const { portfolioData, loading } = usePortfolio();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      setError(null);
      
      const username = portfolioData?.github_username;
      if (!username) {
        setError('Username GitHub belum diatur di Panel Admin.');
        setLocalLoading(false);
        return;
      }

      const data = await fetchGitHubStats(username);
      if (data) {
        setStats(data);
      } else {
        setError(`Gagal mengambil data untuk: ${username}. Periksa Token & Username.`);
      }
      setLocalLoading(false);
    };

    if (!loading) loadData();
  }, [portfolioData, loading]);

  if (localLoading) return <div className="text-primary font-code-sm animate-pulse">Menghubungkan ke GitHub...</div>;
  
  if (error) return (
    <div className="border border-error/20 p-6 bg-error-container/5 rounded-lg text-error font-code-sm">
      <p className="font-bold mb-2">⚠️ Error Dashboard</p>
      <p>{error}</p>
      <p className="text-xs mt-2 opacity-70">Cek Console (F12) untuk detail teknis.</p>
    </div>
  );

  const { profile, stats: dataStats } = stats;

  return (
    <div className="space-y-6">
      {/* 1. Profil Statistik Utama */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Repositori', val: profile.publicRepos },
          { label: 'Total Stars', val: dataStats.totalStars },
          { label: 'Forks', val: dataStats.totalForks },
          { label: 'Followers', val: profile.followers }
        ].map((item, i) => (
          <div key={i} className="border border-border p-4 bg-surface-container-low rounded-lg text-center terminal-glow">
            <p className="text-2xl font-bold text-primary">{item.val}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 2. Visualisasi Grafis Bahasa Pemrograman */}
      <div className="border border-border p-6 bg-surface-container-low rounded-lg">
        <h3 className="text-sm font-bold text-text-bright mb-6 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">code</span>
          Distribusi Bahasa Pemrograman
        </h3>
        <div className="space-y-4">
          {dataStats.languages.slice(0, 4).map(lang => (
            <div key={lang.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-code-sm">{lang.name}</span>
                <span className="text-primary font-bold">{lang.percentage}</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-1000 ease-out" 
                  style={{ width: lang.percentage }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Repositori Teratas */}
      <div className="border border-border bg-surface-container-low rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-bright uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">rocket_launch</span>
            Repositori Unggulan
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
            <tr>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3 text-right">Stars</th>
              <th className="px-6 py-3">Language</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-border">
            {dataStats.topRepos.slice(0, 4).map(repo => (
              <tr key={repo.name} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-3 text-primary font-bold truncate max-w-[150px]">{repo.name}</td>
                <td className="px-6 py-3 text-right text-text-bright">{repo.stars}</td>
                <td className="px-6 py-3 text-on-surface-variant">{repo.language || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

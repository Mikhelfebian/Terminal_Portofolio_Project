import { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export function DataPage() {
  const { githubStats, portfolioData, loading, refreshGitHub } = usePortfolio();
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const barTimer = setTimeout(() => setAnimateBars(true), 300);
    return () => clearTimeout(barTimer);
  }, [githubStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-y-4 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-code-sm text-sm text-primary animate-pulse">Mengambil data dari GitHub...</p>
        </div>
      </div>
    );
  }

  if (!githubStats) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="border border-red-500/20 p-5 bg-red-500/5 rounded-lg">
          <p className="font-semibold text-sm text-red-400 mb-2">Gagal memuat data GitHub</p>
          <p className="text-xs text-gray-400 mb-3">
            @{portfolioData.github_username} — periksa token dan username.
          </p>
          <button
            onClick={() => refreshGitHub()}
            className="text-xs text-primary border border-primary px-3 py-1.5 hover:bg-primary hover:text-black transition-colors cursor-pointer rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const profile = githubStats.profile;
  const stats = githubStats.stats;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border">
        {profile?.avatar ? (
          <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full border border-primary/40" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-bright text-base truncate">{profile?.name || 'Unknown'}</h3>
          <p className="text-xs text-on-surface-variant truncate">{profile?.bio || ''}</p>
          <button onClick={() => refreshGitHub()} className="text-xs text-primary hover:underline mt-1 inline-block cursor-pointer">
            refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Stars', val: stats?.totalStars ?? 0 },
          { label: 'Repos', val: profile?.publicRepos ?? 0 },
          { label: 'Forks', val: stats?.totalForks ?? 0 },
          { label: 'Followers', val: profile?.followers ?? 0 },
        ].map((item) => (
          <div key={item.label} className="border border-border rounded-lg p-3 bg-surface text-center">
            <div className="text-lg font-bold text-primary">{item.val}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {stats?.languages && stats.languages.length > 0 && (
        <div className="border border-border rounded-lg bg-surface p-4">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Languages</h4>
          <div className="space-y-2.5">
            {stats.languages.slice(0, 5).map((lang) => {
              const pct = parseFloat(lang.percentage);
              return (
                <div key={lang.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-bright">{lang.name}</span>
                    <span className="text-primary font-medium">{lang.percentage}</span>
                  </div>
                  <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000 ease-out" style={{ width: animateBars ? `${pct}%` : '0%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats?.topRepos && stats.topRepos.length > 0 && (
        <div className="border border-border rounded-lg bg-surface">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3 border-b border-border">
            Top Repos
          </h4>
          <div className="divide-y divide-border/50 text-xs">
            {stats.topRepos.slice(0, 4).map((repo) => (
              <div key={repo.name} className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors">
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-primary font-medium truncate max-w-[180px] hover:underline">
                  {repo.name}
                </a>
                <div className="flex items-center gap-3 text-on-surface-variant shrink-0">
                  <span>{repo.language || '-'}</span>
                  <span className="text-text-bright">{repo.stars} ★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const CACHE_KEY = 'github_api_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 menit
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchGitHubStats(username) {
  if (!username) return null;

  // Cek cache lokal dulu
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${username}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) return data;
    }
  } catch { /* ignore */ }

  // Coba backend proxy dulu (production mode)
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/github/${encodeURIComponent(username)}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`${CACHE_KEY}_${username}`, JSON.stringify({ data, timestamp: Date.now() }));
        return data;
      }
    } catch { /* fallback to direct API */ }
  }

  // Fallback: GitHub public API (tanpa token, 60 req/jam)
  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (!profileRes.ok) return null;

    const [profile, repos] = await Promise.all([profileRes.json(), reposRes.json()]);

    let totalStars = 0;
    let totalForks = 0;
    const languages = {};
    const formattedRepos = [];

    for (const repo of repos) {
      if (repo.fork) continue;
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
      if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
      formattedRepos.push({
        name: repo.name,
        stars: repo.stargazers_count,
        url: repo.html_url,
        language: repo.language,
      });
    }

    formattedRepos.sort((a, b) => b.stars - a.stars);
    const totalLangRepos = Object.values(languages).reduce((a, b) => a + b, 0);
    const languageStats = Object.entries(languages)
      .map(([name, count]) => ({
        name,
        percentage: ((count / totalLangRepos) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const stats = {
      profile: {
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        bio: profile.bio,
        publicRepos: profile.public_repos,
        followers: profile.followers,
      },
      stats: {
        totalStars,
        totalForks,
        languages: languageStats,
        topRepos: formattedRepos.slice(0, 6),
      },
    };

    localStorage.setItem(`${CACHE_KEY}_${username}`, JSON.stringify({ data: stats, timestamp: Date.now() }));
    return stats;
  } catch {
    return null;
  }
}

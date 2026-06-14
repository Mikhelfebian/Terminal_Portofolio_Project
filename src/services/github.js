const CACHE_KEY = 'github_api_cache';
const CACHE_DURATION = 1000 * 60 * 30;

export async function fetchGitHubStats(username) {
  if (!username) return null;

  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${username}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) return data;
    }
  } catch { }

  try {
    const res = await fetch(`/api/github/${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(`${CACHE_KEY}_${username}`, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch {
    return null;
  }
}

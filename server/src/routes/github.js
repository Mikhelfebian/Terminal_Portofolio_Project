import { Router } from 'express';
import { config } from '../config.js';
import { TtlCache } from '../cache.js';

const router = Router();
const cache = new TtlCache(30 * 60 * 1000); // 30 min

const GITHUB_API = 'https://api.github.com';

router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return res.status(422).json({ error: 'Invalid GitHub username format' });
    }

    const cached = cache.get(username);
    if (cached) return res.json(cached);

    const headers = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${config.secrets.githubToken}`,
      'User-Agent': 'terminal-bio-api',
    };

    const [profileRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}`, { headers }),
      fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    ]);

    if (!profileRes.ok) {
      const status = profileRes.status;
      if (status === 404) return res.status(404).json({ error: 'GitHub user not found' });
      if (status === 403) return res.status(429).json({ error: 'GitHub rate limit exceeded' });
      return res.status(status).json({ error: 'GitHub API error' });
    }

    const [profile, repos] = await Promise.all([profileRes.json(), reposRes.json()]);

    const stats = repos.reduce(
      (acc, repo) => {
        if (!repo.fork) {
          acc.totalStars += repo.stargazers_count;
          acc.totalForks += repo.forks_count;
          if (repo.language) {
            acc.languages[repo.language] = (acc.languages[repo.language] || 0) + 1;
          }
        }
        return acc;
      },
      { totalStars: 0, totalForks: 0, languages: {} },
    );

    const totalLangRepos = Object.values(stats.languages).reduce((a, b) => a + b, 0);
    const languageStats = Object.entries(stats.languages)
      .map(([name, count]) => ({
        name,
        percentage: ((count / totalLangRepos) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const topRepos = repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((r) => ({ name: r.name, stars: r.stargazers_count, url: r.html_url, language: r.language }));

    const result = {
      profile: {
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        bio: profile.bio,
        publicRepos: profile.public_repos,
        followers: profile.followers,
      },
      stats: {
        totalStars: stats.totalStars,
        totalForks: stats.totalForks,
        languages: languageStats,
        topRepos,
      },
    };

    cache.set(username, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

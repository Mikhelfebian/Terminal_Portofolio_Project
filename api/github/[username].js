export default async function handler(req, res) {
  try {
    const { username } = req.query;

    if (!username || !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return res.status(422).json({ error: 'Invalid GitHub username format' });
    }

    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'terminal-bio-api',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    ]);

    if (!profileRes.ok) {
      const status = profileRes.status;
      if (status === 404) return res.status(404).json({ error: 'GitHub user not found' });
      if (status === 403) return res.status(429).json({ error: 'GitHub rate limit exceeded. Set GITHUB_TOKEN in Vercel env.' });
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

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

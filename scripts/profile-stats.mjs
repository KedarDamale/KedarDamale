import { theme as t, text, svg } from './profile-theme.mjs';

export function renderStats(username, repositories, annual, now = new Date()) {
  const count = value => {
    if (!Number.isInteger(value) || value < 0) throw new Error('Invalid GitHub statistic.');
    return value;
  };
  if (!Array.isArray(repositories) || !annual?.startedAt || !annual?.endedAt) throw new Error('Missing GitHub statistics.');
  const stars = repositories.filter(repo => !repo.isFork).reduce((sum, repo) => sum + count(repo.stargazerCount), 0);
  const metrics = [
    [repositories.length, 'Public repositories'], [stars, 'Stars on owned projects'],
    [count(annual.totalCommitContributions), 'Commit contributions'],
    [count(annual.totalIssueContributions), 'Issue contributions'],
    [count(annual.totalPullRequestContributions), 'Pull-request contributions'],
    [count(annual.totalPullRequestReviewContributions), 'Review contributions'],
  ];
  const range = `${annual.startedAt.slice(0, 10)} → ${annual.endedAt.slice(0, 10)}`;
  return svg(960, 294, `${username}'s GitHub statistics`,
    `${metrics.map(([value, label]) => `${value} ${label.toLowerCase()}`).join('; ')}. Contribution window: ${range}. Stars exclude forks.`,
    `${text(28, 38, 'GITHUB STATS', { size: 14, mono: true, fill: t.mint })}
    ${text(28, 62, `Contribution window: ${range}`, { size: 13, fill: t.muted })}
    ${metrics.map(([value, label], index) => {
      const x = 28 + (index % 3) * 312, y = 118 + Math.floor(index / 3) * 97;
      return `${text(x, y, value.toLocaleString('en-US'), { size: 36, weight: 700, fill: index < 2 ? t.mint : t.violet })}${text(x, y + 26, label, { size: 16, fill: t.muted })}`;
    }).join('')}
    <path d="M28 166H932" stroke="${t.border}"/>
    ${text(28, 274, 'Reported by GitHub · stars exclude forked repositories', { size: 12, fill: t.muted })}
    ${text(932, 274, `Updated ${now.toISOString().slice(0, 10)}`, { size: 12, anchor: 'end', fill: t.muted })}`);
}

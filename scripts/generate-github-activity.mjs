import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { theme as t, escapeXml, text, svg } from './profile-theme.mjs';
import { renderStats } from './profile-stats.mjs';

const dayMs = 24 * 60 * 60 * 1000;
const dateOnly = date => date.toISOString().slice(0, 10);
const levelIndex = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

export function activityRange(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid activity date.');
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 4, 1)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59)),
  };
}

export function renderActivity(username, calendar, now = new Date()) {
  const { start, end } = activityRange(now);
  if (!Array.isArray(calendar?.weeks)) throw new Error('GitHub returned an invalid contribution calendar.');
  const days = calendar.weeks.flatMap(week => week.contributionDays);
  const contributionByDate = new Map();
  for (const day of days) {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.contributionCount) || day.contributionCount < 0) {
      throw new Error('GitHub returned an invalid contribution day.');
    }
    if (day.date >= dateOnly(start) && day.date <= dateOnly(end)) contributionByDate.set(day.date, day);
  }
  const total = [...contributionByDate.values()].reduce((sum, day) => sum + day.contributionCount, 0);
  const activeDays = [...contributionByDate.values()].filter(day => day.contributionCount > 0).length;
  const startGrid = new Date(start);
  startGrid.setUTCDate(startGrid.getUTCDate() - startGrid.getUTCDay());
  const weeks = Math.floor((end - startGrid) / (7 * dayMs)) + 1;
  const cell = 16, gap = 7, left = 66, top = 104;
  const squares = [];
  for (let week = 0; week < weeks; week++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = new Date(startGrid.getTime() + (week * 7 + weekday) * dayMs);
      const key = dateOnly(date);
      const outside = key < dateOnly(start) || key > dateOnly(end);
      const day = contributionByDate.get(key);
      const level = outside ? 0 : levelIndex[day?.contributionLevel] ?? 0;
      const count = day?.contributionCount ?? 0;
      const description = outside ? `${key}: outside the displayed range` : `${key}: ${count} contribution${count === 1 ? '' : 's'}`;
      squares.push(`<rect x="${left + week * (cell + gap)}" y="${top + weekday * (cell + gap)}" width="${cell}" height="${cell}" rx="3" fill="${t.levels[level]}"${outside ? ' opacity=".25"' : ''}><title>${description}</title></rect>`);
    }
  }
  const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
  const rangeFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const monthLabels = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
    const week = Math.floor((cursor - startGrid) / (7 * dayMs));
    monthLabels.push(text(left + week * (cell + gap), 88, monthFormat.format(cursor), { size: 13, fill: t.muted }));
  }
  const title = `${username}'s GitHub activity — ${rangeFormat.format(start)} to ${rangeFormat.format(end)}`;
  return svg(960, 294, title, `${total} contributions and ${activeDays} active days across five calendar months. Updated ${dateOnly(now)}.`,
    `${text(28, 40, 'GITHUB ACTIVITY', { size: 14, fill: t.mint, mono: true })}
    ${text(28, 63, 'Five calendar months · contribution counts from GitHub', { size: 14, fill: t.muted })}
    ${[1, 3, 5].map((row, i) => text(22, top + row * (cell + gap) + 12, ['M', 'W', 'F'][i], { size: 12, fill: t.muted })).join('')}
    ${monthLabels.join('\n')}${squares.join('\n')}
    <path d="M662 80V254" stroke="${t.border}"/>
    ${text(694, 130, total.toLocaleString('en-US'), { size: 43, weight: 700, fill: t.mint })}
    ${text(694, 159, 'contributions in this range', { size: 16, fill: t.muted })}
    ${text(694, 206, String(activeDays), { size: 30, weight: 700, fill: t.violet })}
    ${text(758, 206, 'active days', { size: 16, fill: t.muted })}
    ${text(694, 247, `Updated ${dateOnly(now)}`, { size: 13, mono: true, fill: t.muted })}
    ${text(left, 272, 'Less', { size: 12, fill: t.muted })}
    ${t.levels.map((fill, i) => `<rect x="${left + 40 + i * 22}" y="259" width="16" height="16" rx="3" fill="${fill}"/>`).join('')}
    ${text(left + 157, 272, 'More', { size: 12, fill: t.muted })}`);
}

async function main() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.PROFILE_ACTIVITY_TOKEN || process.env.GITHUB_TOKEN;
  if (!username || !token) throw new Error('Set GITHUB_USERNAME and GITHUB_TOKEN (or PROFILE_ACTIVITY_TOKEN).');
  const now = new Date();
  const { start, end } = activityRange(now);
  async function github(query, variables) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'KedarDamale-profile-activity-generator' },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ query, variables }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors || !payload.data?.user) throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(payload.errors || payload)}`);
    return payload.data.user;
  }
  const user = await github(`query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) { contributionsCollection(from: $from, to: $to) {
          contributionCalendar { totalContributions weeks { contributionDays { contributionCount contributionLevel date } } }
        }
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
          nodes { isFork stargazerCount } pageInfo { hasNextPage endCursor }
        }
        annual: contributionsCollection {
          startedAt endedAt totalCommitContributions totalIssueContributions
          totalPullRequestContributions totalPullRequestReviewContributions
        }
        }
      }`, { login: username, from: start.toISOString(), to: end.toISOString() });
  const calendar = user.contributionsCollection.contributionCalendar;
  const repositories = [...user.repositories.nodes];
  let pageInfo = user.repositories.pageInfo;
  while (pageInfo.hasNextPage) {
    const page = await github(`query ($login: String!, $after: String!) {
      user(login: $login) { repositories(first: 100, after: $after, ownerAffiliations: OWNER, privacy: PUBLIC) {
        nodes { isFork stargazerCount } pageInfo { hasNextPage endCursor }
      } }
    }`, { login: username, after: pageInfo.endCursor });
    repositories.push(...page.repositories.nodes);
    pageInfo = page.repositories.pageInfo;
  }
  const content = renderActivity(username, calendar, now);
  const stats = renderStats(username, repositories, user.annual, now);
  const output = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'github-activity.svg');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, content);
  await writeFile(resolve(dirname(output), 'github-stats.svg'), stats);
  console.log(`Wrote ${output} (${escapeXml(username)}, ${dateOnly(start)} to ${dateOnly(end)}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

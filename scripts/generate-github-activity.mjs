import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const username = process.env.GITHUB_USERNAME;
const token = process.env.PROFILE_ACTIVITY_TOKEN || process.env.GITHUB_TOKEN;

if (!username || !token) {
  throw new Error('Set GITHUB_USERNAME and GITHUB_TOKEN (or PROFILE_ACTIVITY_TOKEN).');
}

const now = new Date();
const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1));
const end = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate(),
  23,
  59,
  59,
));
const dateOnly = (date) => date.toISOString().slice(0, 10);

const query = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`;

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'KedarDamale-profile-activity-generator',
  },
  body: JSON.stringify({
    query,
    variables: { login: username, from: start.toISOString(), to: end.toISOString() },
  }),
});
const payload = await response.json();

if (!response.ok || payload.errors || !payload.data?.user) {
  throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(payload.errors || payload)}`);
}

const calendar = payload.data.user.contributionsCollection.contributionCalendar;
const contributionByDate = new Map(
  calendar.weeks.flatMap((week) => week.contributionDays).map((day) => [day.date, day]),
);
const dayMs = 24 * 60 * 60 * 1000;
const startGrid = new Date(start);
startGrid.setUTCDate(startGrid.getUTCDate() - startGrid.getUTCDay());
const endGrid = new Date(end);
endGrid.setUTCDate(endGrid.getUTCDate() + (6 - endGrid.getUTCDay()));
const weeks = Math.round((endGrid - startGrid) / (7 * dayMs)) + 1;

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long', year: 'numeric', timeZone: 'UTC',
});
const title = `${username}'s GitHub activity — ${rangeFormatter.format(start)} to ${rangeFormatter.format(end)}`;
const levelClass = {
  NONE: 'level-0',
  FIRST_QUARTILE: 'level-1',
  SECOND_QUARTILE: 'level-2',
  THIRD_QUARTILE: 'level-3',
  FOURTH_QUARTILE: 'level-4',
};
const cell = 10;
const gap = 4;
const left = 32;
const top = 34;
const width = left + weeks * (cell + gap) + 8;
const height = top + 7 * (cell + gap) + 24;
const squares = [];

for (let week = 0; week < weeks; week += 1) {
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const date = new Date(startGrid.getTime() + (week * 7 + weekday) * dayMs);
    const dateKey = dateOnly(date);
    const day = contributionByDate.get(dateKey);
    const level = day ? levelClass[day.contributionLevel] || 'level-0' : 'level-0';
    const count = day?.contributionCount || 0;
    squares.push(
      `<rect class="day ${level}" x="${left + week * (cell + gap)}" y="${top + weekday * (cell + gap)}" width="${cell}" height="${cell}" rx="2"><title>${dateKey}: ${count} contribution${count === 1 ? '' : 's'}</title></rect>`,
    );
  }
}

const monthLabels = [];
for (let cursor = new Date(start); cursor <= end; cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
  const week = Math.floor((cursor - startGrid) / (7 * dayMs));
  monthLabels.push(`<text class="label" x="${left + week * (cell + gap)}" y="22">${monthFormatter.format(cursor)}</text>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${title}</title>
  <desc id="description">${calendar.totalContributions} contributions across the last five calendar months.</desc>
  <style>
    .label { fill: #57606a; font: 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .day { fill: #ebedf0; }
    .level-1 { fill: #9be9a8; } .level-2 { fill: #40c463; } .level-3 { fill: #30a14e; } .level-4 { fill: #216e39; }
    @media (prefers-color-scheme: dark) {
      .label { fill: #8b949e; } .day { fill: #161b22; }
      .level-1 { fill: #0e4429; } .level-2 { fill: #006d32; } .level-3 { fill: #26a641; } .level-4 { fill: #39d353; }
    }
  </style>
  <text class="label" x="0" y="${top + cell + gap - 2}">Mon</text>
  <text class="label" x="0" y="${top + 3 * (cell + gap) + cell - 2}">Wed</text>
  <text class="label" x="0" y="${top + 5 * (cell + gap) + cell - 2}">Fri</text>
  ${monthLabels.join('\n  ')}
  ${squares.join('\n  ')}
  <text class="label" x="${left}" y="${height - 5}">${calendar.totalContributions} contributions in this period</text>
</svg>\n`;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, '..', 'assets', 'github-activity.svg');
await writeFile(outputPath, svg);
console.log(`Wrote ${outputPath} (${calendar.totalContributions} contributions, ${dateOnly(start)} to ${dateOnly(end)}).`);

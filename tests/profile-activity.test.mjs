import test from 'node:test';
import assert from 'node:assert/strict';
import { activityRange, renderActivity } from '../scripts/generate-github-activity.mjs';
import { renderStats } from '../scripts/profile-stats.mjs';

test('five calendar months cross the year boundary using UTC', () => {
  const { start, end } = activityRange(new Date('2026-01-01T00:15:00Z'));
  assert.equal(start.toISOString(), '2025-09-01T00:00:00.000Z');
  assert.equal(end.toISOString(), '2026-01-01T23:59:59.000Z');
});

test('a leap day remains within the displayed calendar range', () => {
  const { start, end } = activityRange(new Date('2024-02-29T23:30:00Z'));
  assert.equal(start.toISOString(), '2023-10-01T00:00:00.000Z');
  assert.equal(end.toISOString(), '2024-02-29T23:59:59.000Z');
});

test('totals exclude API padding outside the range and count only active days', () => {
  const calendar = { totalContributions: 999, weeks: [{ contributionDays: [
    { date: '2026-05-31', contributionCount: 90, contributionLevel: 'FOURTH_QUARTILE' },
    { date: '2026-06-01', contributionCount: 3, contributionLevel: 'FIRST_QUARTILE' },
    { date: '2026-10-12', contributionCount: 0, contributionLevel: 'NONE' },
    { date: '2026-10-13', contributionCount: 7, contributionLevel: 'SECOND_QUARTILE' },
    { date: '2026-10-14', contributionCount: 100, contributionLevel: 'FOURTH_QUARTILE' },
  ] }] };
  const content = renderActivity('Kedar & <example>', calendar, new Date('2026-10-13T06:00:00Z'));
  assert(content.includes('10 contributions and 2 active days across five calendar months'));
  assert(content.includes('2026-05-31: outside the displayed range'));
  assert(content.includes('2026-10-14: outside the displayed range'));
  assert(content.includes('Kedar &amp; &lt;example&gt;'));
  assert(!content.includes('999 contributions'));
});

test('invalid dates and malformed contribution data fail before writing a graph', () => {
  assert.throws(() => activityRange(new Date('invalid')), /Invalid activity date/);
  assert.throws(() => renderActivity('Kedar', {}), /invalid contribution calendar/);
  assert.throws(() => renderActivity('Kedar', { weeks: [{ contributionDays: [
    { date: '2026-10-13', contributionCount: -2 },
  ] }] }), /invalid contribution day/);
});

test('stats count owned public repositories while excluding forks from star totals', () => {
  const annual = { startedAt: '2025-10-13T00:00:00Z', endedAt: '2026-10-13T00:00:00Z',
    totalCommitContributions: 17, totalIssueContributions: 3,
    totalPullRequestContributions: 5, totalPullRequestReviewContributions: 2 };
  const content = renderStats('Kedar', [
    { isFork: false, stargazerCount: 4 }, { isFork: true, stargazerCount: 900 },
    { isFork: false, stargazerCount: 2 },
  ], annual, new Date('2026-10-13T06:00:00Z'));
  assert(content.includes('3 public repositories; 6 stars on owned projects; 17 commit contributions'));
  assert(content.includes('3 issue contributions; 5 pull-request contributions; 2 review contributions'));
  assert(!content.includes('906'));
});

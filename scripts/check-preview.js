// Browser QA uses an existing Playwright installation when available.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');

function playwright() {
  try { return require('playwright'); } catch {}
  const cache = path.join(process.env.HOME, '.npm/_npx');
  for (const entry of fs.readdirSync(cache)) {
    const candidate = path.join(cache, entry, 'node_modules/playwright/package.json');
    if (fs.existsSync(candidate)) return createRequire(candidate)('playwright');
  }
  throw new Error('Playwright is required for browser QA.');
}

(async () => {
  const browser = await playwright().chromium.launch({ headless: true });
  const report = { checks: [], errors: [], screenshots: [] };
  const outputDir = process.env.PORTFOLIO_QA_DIR || '/tmp/kedar-portfolio-qa';
  fs.mkdirSync(outputDir, { recursive: true });
  const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(baseUrl) && response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.hero h1');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.title(), 'Kedar Damale — Applied Data Scientist');
    assert.equal(await page.locator('.hero h1').textContent(), 'Kedar Damale.');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(10, 25, 47)');
    assert(await page.evaluate(() => document.fonts.check('600 80px Calibre') && document.fonts.check('400 13px "SF Mono"')));
    report.checks.push('Reference palette and local fonts loaded');

    await page.getByRole('tab', { name: 'Propelligence' }).click();
    assert(await page.locator('#panel-propelligence').isVisible());
    assert(await page.locator('#panel-globalspace').isHidden());
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.getByRole('tab', { name: 'Globalspace' }).getAttribute('aria-selected'), 'true');
    report.checks.push('Experience tabs respond to mouse and keyboard');

    assert.equal(await page.locator('.repo-card').count(), 6);
    await page.getByRole('button', { name: 'Show More', exact: true }).click();
    assert.equal(await page.locator('.repo-card').count(), 7);
    await page.getByRole('button', { name: 'Show Less', exact: true }).click();
    assert.equal(await page.locator('.repo-card').count(), 6);
    report.checks.push('Project expansion and collapse work');

    const resumeUrl = await page.locator('[data-resume-link]').getAttribute('href');
    const resumeResponse = await context.request.get(new URL(resumeUrl, baseUrl + '/').href);
    assert.equal(resumeResponse.status(), 200);
    assert((await resumeResponse.body()).subarray(0, 4).toString() === '%PDF');
    report.checks.push('Latest resume link downloads a valid PDF');

    async function capture(name, width, height) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(700);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name}: horizontal overflow`);
      const heroPath = path.join(outputDir, `${name}.png`);
      await page.screenshot({ path: heroPath });
      const positions = await page.locator('main [data-reveal]').evaluateAll(sections => sections.map(section => section.getBoundingClientRect().top + window.scrollY));
      for (const top of positions) {
        await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
        await page.waitForTimeout(160);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(700);
      const fullPath = path.join(outputDir, `${name}-full.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      report.screenshots.push(heroPath, fullPath);
      report.checks.push(`${name}: responsive layout without horizontal overflow`);
    }
    await capture('desktop', 1440, 900);
    await capture('tablet', 768, 1024);
    await capture('mobile', 390, 844);
    await capture('small-mobile', 320, 720);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.locator('.site-nav').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    assert.equal(await page.getByRole('button', { name: 'Close navigation menu' }).getAttribute('aria-expanded'), 'true');
    assert(await page.locator('main').evaluate(element => element.inert));
    await page.locator('.site-nav [data-resume-link]').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'menu-toggle');
    await page.screenshot({ path: path.join(outputDir, 'mobile-menu.png') });
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Open navigation menu' }).getAttribute('aria-expanded'), 'false');
    assert(!(await page.locator('main').evaluate(element => element.inert)));
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.locator('.site-nav a').filter({ hasText: 'Experience' }).click();
    await page.waitForTimeout(800);
    assert.equal(new URL(page.url()).hash, '#experience');
    assert.equal(await page.getByRole('button', { name: 'Open navigation menu' }).getAttribute('aria-expanded'), 'false');
    await page.getByRole('tab', { name: 'Globalspace' }).focus();
    await page.keyboard.press('ArrowRight');
    assert(await page.locator('#panel-propelligence').isVisible());
    report.checks.push('Mobile menu focus trap, Escape, section links, and horizontal tabs work');

    await page.goto(baseUrl + '/archive.html', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.repo-card').count(), 10);
    await page.getByRole('searchbox').fill('Stockfish');
    assert.equal(await page.locator('.repo-card').count(), 1);
    await page.getByRole('searchbox').fill('no-match-project-123');
    assert.equal(await page.locator('.repo-card').count(), 0);
    assert(await page.locator('.repo-empty').isVisible());
    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'Automation', exact: true }).click();
    assert.equal(await page.locator('.repo-card').count(), 2);
    await page.getByRole('button', { name: 'All work', exact: true }).click();
    assert.equal(await page.locator('.repo-card').count(), 10);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: path.join(outputDir, 'archive-mobile.png'), fullPage: true });
    report.checks.push('Archive search, categories, empty state, and mobile layout work');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(baseUrl + '/#about', { waitUntil: 'networkidle' });
    assert(await page.locator('.hero h1').evaluate(element => parseFloat(getComputedStyle(element).animationDuration) <= .001));
    assert(await page.locator('#about').evaluate(element => element.getBoundingClientRect().top >= 0 && element.getBoundingClientRect().top < 150));
    report.checks.push('Reduced motion and direct section URLs work');

    await page.setContent('<body style="margin:0;background:white;padding:30px"><img style="width:100%" src="' + baseUrl + '/assets/kedar-wordmark.svg"></body>');
    await page.locator('img').waitFor();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outputDir, 'wordmark.png') });
    const svg = fs.readFileSync(path.resolve('portfolio/assets/kedar-wordmark.svg'), 'utf8');
    assert(!svg.includes('<image') && !svg.includes('<text'));
    report.checks.push('Wordmark is standalone vector paths with no embedded image or font dependencies');
    assert.deepEqual(report.errors, [], 'Browser or asset loading errors');
    fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(report.checks.join('\n'));
    console.log(`Screenshots and report: ${outputDir}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

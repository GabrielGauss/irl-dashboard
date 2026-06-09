import { chromium } from 'playwright';

const settings = {
  baseUrl: 'http://localhost:4000',
  token: 'demo-read-token',
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Pre-seed settings so the app connects immediately.
await page.addInitScript((s) => {
  localStorage.setItem('irl-dashboard.settings.v1', JSON.stringify(s));
}, settings);

page.on('console', (m) => {
  if (m.type() === 'error') console.log('PAGE ERROR:', m.text());
});

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'mock/shot-overview.png' });

await page.getByRole('button', { name: 'Agents' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'mock/shot-agents.png' });

await page.getByRole('button', { name: 'Traces' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'mock/shot-traces.png' });

// Open a trace drawer.
const firstRow = page.locator('main button').filter({ hasText: '/' }).first();
await page.locator('div', { hasText: 'Compliance Trace Ledger' }).first().waitFor();
const rows = page.locator('main >> button');
await page.waitForTimeout(400);
await page.locator('span.text-accent-bright\\/90').first().click().catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: 'mock/shot-trace-detail.png' });
await page.keyboard.press('Escape');

await page.getByRole('button', { name: 'Audit Log' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'mock/shot-audit.png' });

void firstRow;
await browser.close();
console.log('screenshots done');

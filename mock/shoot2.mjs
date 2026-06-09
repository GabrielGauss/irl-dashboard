import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// No localStorage seed → unconfigured state + auto-open settings modal.
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'mock/shot-settings.png' });

// Now point at a dead engine to verify error state.
await page.evaluate(() => {
  localStorage.setItem(
    'irl-dashboard.settings.v1',
    JSON.stringify({ baseUrl: 'http://localhost:9999', token: 'x' }),
  );
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'mock/shot-error.png' });

// Mobile / narrow check at 1024 min width.
await page.setViewportSize({ width: 1024, height: 768 });
await page.evaluate(() => {
  localStorage.setItem(
    'irl-dashboard.settings.v1',
    JSON.stringify({ baseUrl: 'http://localhost:4000', token: 'demo-read-token' }),
  );
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'mock/shot-1024.png' });

await browser.close();
console.log('done2');

// Capture tablet screenshots only (768×1024)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://app.moncherjournal.com';
const EMAIL = 'chapter.collector@example.com';
const PASSWORD = 'user123';
const OUT = path.join(ROOT, '.kombai/screenshots');

mkdirSync(OUT, { recursive: true });

const SECTIONS = ['my-books', 'preferences', 'account-info', 'notifications', 'devices', 'purchases'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 45000 });
  await page.waitForTimeout(2000);
  console.log(`[auth OK] at: ${page.url()}`);

  for (const id of SECTIONS) {
    await page.goto(`${BASE_URL}/account/${id}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    const outPath = path.join(OUT, `W11-${id}-tablet.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`✓ W11-${id}-tablet.png`);
  }

  await browser.close();
  console.log('✅ Tablet screenshots done.');
})();

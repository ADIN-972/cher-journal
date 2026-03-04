// Capture screenshots of Account page (W11) — all sections
// Uses single page navigation to preserve auth state in React memory
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

const SECTIONS = [
  { id: 'my-books',      label: 'Ma Bibliothèque' },
  { id: 'purchases',     label: 'Historique Achats' },
  { id: 'promotions',    label: 'Promotions' },
  { id: 'subscription',  label: 'Abonnement' },
  { id: 'preferences',   label: 'Préférences' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'devices',       label: 'Appareils' },
  { id: 'account-info',  label: 'Infos Compte' },
  { id: 'payment-info',  label: 'Paiement' },
  { id: 'reviews',       label: 'Avis' },
  { id: 'claims',        label: 'Support' },
];

async function captureWithAuth(viewport, suffix, mobileSections = null) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport,
    isMobile: !!mobileSections,
    hasTouch: !!mobileSections,
  });
  const page = await ctx.newPage();

  // ── 1. Login ──
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  // Try button[type="submit"] first (most common), fallback to input[type="submit"]
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForTimeout(1500);
  console.log(`  [auth OK] at: ${page.url()}`);

  // ── 2. Capture each section on the SAME page ──
  const targets = mobileSections || SECTIONS;
  for (const section of targets) {
    await page.goto(`${BASE_URL}/account/${section.id}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    // Dismiss any overlay/modal that might have appeared
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const outPath = path.join(OUT, `W11-${section.id}-${suffix}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`  ✓ W11-${section.id}-${suffix}.png`);
  }

  await browser.close();
}

(async () => {
  console.log('\n[Desktop 1280×800]');
  await captureWithAuth({ width: 1280, height: 800 }, 'desktop');

  console.log('\n[Tablet 768×1024]');
  const tabletSections = ['my-books', 'purchases', 'preferences', 'account-info', 'notifications', 'devices']
    .map(id => SECTIONS.find(s => s.id === id));
  await captureWithAuth({ width: 768, height: 1024 }, 'tablet', tabletSections);

  console.log('\n[Mobile 390×844]');
  const mobileSections = ['my-books', 'purchases', 'account-info', 'preferences']
    .map(id => SECTIONS.find(s => s.id === id));
  await captureWithAuth({ width: 390, height: 844 }, 'mobile', mobileSections);

  console.log('\n✅ All screenshots captured.');
})();

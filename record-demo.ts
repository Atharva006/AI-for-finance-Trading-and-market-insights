import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function recordAppDemo() {
  const videoDir = path.resolve(process.cwd(), 'recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  console.log('[Playwright] Launching browser to record demo...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 },
    },
  });

  // Inject authenticated user into localStorage
  await context.addInitScript(() => {
    const authUser = {
      id: 'bad59b6c-6433-4ab2-a2ce-4211b3a91277',
      email: 'atharvabhosale2023@gmail.com',
      name: 'Atharva Bhosale',
      avatar_url: '/atharva-profile.png',
      provider: 'google',
      role: 'admin',
    };
    localStorage.setItem('alltra_quant_auth_user', JSON.stringify(authUser));
  });

  const page = await context.newPage();

  console.log('[Playwright] Step 1: Navigating to Platform Home...');
  await page.goto('http://localhost:3000/market-overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Scroll down Platform Home smoothly
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  console.log('[Playwright] Step 2: AI Intelligence Desk...');
  await page.goto('http://localhost:3000/intelligence', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Type a realistic query into AI Prompt
  const textarea = page.locator('textarea');
  if (await textarea.count() > 0) {
    await textarea.first().click();
    await textarea.first().fill('How are recent Middle East geopolitical events impacting NIFTY crude and energy stocks?');
    await page.waitForTimeout(2000);
    const sendButton = page.locator('button:has(svg)').last();
    if (await sendButton.count() > 0) {
      await sendButton.click();
      await page.waitForTimeout(6000);
    }
  }

  console.log('[Playwright] Step 3: Paper Trading Desk & Live Order Placement...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Scroll desk to inspect active positions
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  console.log('[Playwright] Step 4: Market Heatmaps...');
  await page.goto('http://localhost:3000/market-heatmaps', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  console.log('[Playwright] Step 5: Backtest Studio...');
  await page.goto('http://localhost:3000/trading-algorithms/backtesting-studio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  console.log('[Playwright] Step 6: Bar Replay Studio...');
  await page.goto('http://localhost:3000/bar-replay', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  console.log('[Playwright] Step 7: About Alltra & Atharva Bhosale Profile & Accreditations...');
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Click on a certificate to open inspection lightbox
  const firstCert = page.locator('.cursor-pointer').nth(1);
  if (await firstCert.count() > 0) {
    await firstCert.click();
    await page.waitForTimeout(4000);
    const closeBtn = page.locator('button:has-text("Close")');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  console.log('[Playwright] Closing page to finalize video recording...');
  await page.close();
  await context.close();
  await browser.close();

  // Find the created video file in videoDir
  const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const rawVideoPath = path.join(videoDir, files[files.length - 1]);
    const finalMp4Path = path.resolve(process.cwd(), 'public/alltra-demo-walkthrough.mp4');
    console.log(`[Playwright] Video recorded: ${rawVideoPath}`);
    console.log(`[Playwright] Converting to MP4 at: ${finalMp4Path}...`);
  }
}

recordAppDemo().catch(err => {
  console.error('[Playwright] Demo recording error:', err);
  process.exit(1);
});

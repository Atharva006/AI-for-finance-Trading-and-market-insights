import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outputDir = path.resolve('demo_videos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chromium with video recording enabled...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Helper smooth scroll
  async function smoothScroll(distance, steps = 15, delay = 50) {
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, distance / steps);
      await page.waitForTimeout(delay);
    }
  }

  try {
    console.log('📍 1. Loading Landing Page...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Scroll through Landing Page
    console.log('  Scrolling hero and features...');
    await smoothScroll(600, 20, 60);
    await page.waitForTimeout(2000);
    await smoothScroll(700, 20, 60);
    await page.waitForTimeout(2000);

    // About Creator section on Landing Page
    await smoothScroll(600, 20, 60);
    await page.waitForTimeout(2500);

    // Scroll to FAQs
    await smoothScroll(500, 15, 60);
    await page.waitForTimeout(2000);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Launch Terminal
    console.log('📍 2. Navigating to Market Overview...');
    await page.goto('http://localhost:3000/market-overview', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await smoothScroll(400, 15, 60);
    await page.waitForTimeout(2500);
    await smoothScroll(-400, 15, 60);
    await page.waitForTimeout(1500);

    // Heatmaps
    console.log('📍 3. Navigating to TradingView Market Heatmaps...');
    await page.goto('http://localhost:3000/market-heatmaps', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    await smoothScroll(300, 10, 60);
    await page.waitForTimeout(2500);

    // Paper Trading Desk
    console.log('📍 4. Navigating to Paper Trading Desk...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await smoothScroll(400, 15, 60);
    await page.waitForTimeout(2500);
    await smoothScroll(-400, 15, 60);
    await page.waitForTimeout(1500);

    // Bar Replay Studio
    console.log('📍 5. Navigating to Bar Replay Studio...');
    await page.goto('http://localhost:3000/bar-replay', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    // Find play button or step buttons if available
    const playBtn = await page.$('button:has-text("Play"), button:has-text("Step")');
    if (playBtn) {
      await playBtn.click();
      await page.waitForTimeout(2000);
    }
    await smoothScroll(300, 10, 60);
    await page.waitForTimeout(2000);

    // Backtest Studio
    console.log('📍 6. Navigating to Backtest Studio...');
    await page.goto('http://localhost:3000/trading-algorithms/backtesting-studio', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Click run backtest if available
    const runBtn = await page.$('button:has-text("Run Backtest"), button:has-text("Execute Backtest"), button:has-text("Run Simulation")');
    if (runBtn) {
      console.log('  Executing quantitative backtest simulation...');
      await runBtn.click();
      await page.waitForTimeout(3000);
    }
    await smoothScroll(500, 20, 60);
    await page.waitForTimeout(3000);
    await smoothScroll(500, 20, 60);
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Algo Marketplace
    console.log('📍 7. Navigating to Algo Marketplace...');
    await page.goto('http://localhost:3000/trading-algorithms', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await smoothScroll(400, 15, 60);
    await page.waitForTimeout(2500);

    // NRI Forex Desk
    console.log('📍 8. Navigating to NRI Forex Desk...');
    await page.goto('http://localhost:3000/forex', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await smoothScroll(300, 10, 60);
    await page.waitForTimeout(2000);

    // About Creator & Testimonials Page
    console.log('📍 9. Navigating to About Creator & Accreditations...');
    await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Hover and inspect testimonials
    console.log('  Showcasing Atharva Bhosale bio & LinkedIn...');
    await smoothScroll(350, 15, 60);
    await page.waitForTimeout(2500);

    // Filter by The 5%ers
    const btn5ers = await page.$('button:has-text("The 5%ers")');
    if (btn5ers) {
      console.log('  Filtering by The 5%ers awards...');
      await btn5ers.click();
      await page.waitForTimeout(2000);
    }

    // Click on the funded trader card to open Lightbox
    const firstCard = await page.$('div:has-text("Officially Funded Trader")');
    if (firstCard) {
      console.log('  Opening Lightbox preview of Funded Trader certificate...');
      await firstCard.click();
      await page.waitForTimeout(4000);
      // Close modal
      const closeBtn = await page.$('button:has-text("Close")');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Filter by FundingPips
    const btnFP = await page.$('button:has-text("FundingPips")');
    if (btnFP) {
      console.log('  Filtering by FundingPips certificates...');
      await btnFP.click();
      await page.waitForTimeout(2500);
    }

    // Scroll down to see certificates
    await smoothScroll(400, 15, 60);
    await page.waitForTimeout(2500);

    // Return to overview for a clean finish
    console.log('📍 10. Returning to Platform Overview Dashboard...');
    await page.goto('http://localhost:3000/market-overview', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('✅ Walkthrough complete! Closing page to finalize video stream...');
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    const videoPath = await videoObj.path();
    console.log('📹 Raw Playwright video saved to:', videoPath);

    const finalWebm = path.join(outputDir, 'alltra_platform_demo.webm');
    const finalMp4 = path.join(outputDir, 'alltra_platform_demo.mp4');

    fs.copyFileSync(videoPath, finalWebm);
    console.log('🎉 Final WebM video ready at:', finalWebm);

    // Convert to YouTube-ready H.264 MP4 with ffmpeg
    try {
      console.log('🎬 Encoding YouTube-ready MP4 (H.264 / 1080p)...');
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${finalWebm}" -c:v libx264 -pix_fmt yuv420p -preset fast -movflags +faststart "${finalMp4}"`, {
        stdio: 'inherit',
      });
      console.log('🚀 MP4 successfully generated at:', finalMp4);
      const stats = fs.statSync(finalMp4);
      console.log(`📊 Video size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (err) {
      console.error('Error during MP4 encoding:', err.message);
    }
  } catch (error) {
    console.error('Failed during video recording:', error);
    await browser.close();
  }
}

run();

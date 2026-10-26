import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

async function generateLogo() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage({
    viewport: { width: 320, height: 120 },
    deviceScaleFactor: 2
  });

  // Absolutely transparent background. No white boxes or halos anywhere.
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap">
  <style>
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background: transparent;
    }
    html, body {
      background: transparent !important;
      display: inline-flex;
      align-items: center;
      padding: 0;
      margin: 0;
    }
    #logo-container {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      height: 32px;
      background: transparent !important;
      padding: 0;
    }
    .icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(18, 9, 36, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-badge svg {
      width: 17px;
      height: 17px;
    }
    .logo-text {
      font-family: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 23px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1;
      display: inline-flex;
      align-items: baseline;
      gap: 3px;
      background: transparent !important;
      user-select: none;
    }
    .text-aura {
      color: #f5f5f4;
      background: transparent !important;
    }
    .text-ai {
      background: linear-gradient(135deg, #fcd34d 0%, #a855f7 50%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div id="logo-container">
    <div class="icon-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="none">
        <defs>
          <linearGradient id="bolt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#c084fc"/>
            <stop offset="100%" stop-color="#818cf8"/>
          </linearGradient>
        </defs>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt)"/>
      </svg>
    </div>
    <div class="logo-text">
      <span class="text-aura">Aura</span><span class="text-ai">AI</span>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(500);

  const element = await page.$('#logo-container');
  if (!element) throw new Error('#logo-container not found');

  const pubDir = path.resolve('public/assets');
  const srcDir = path.resolve('src/assets');
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

  const pubPath = path.join(pubDir, 'logo.png');
  const srcPath = path.join(srcDir, 'logo.png');

  // omitBackground: true ensures 100% alpha transparency outside glyphs
  await element.screenshot({
    path: pubPath,
    omitBackground: true
  });

  fs.copyFileSync(pubPath, srcPath);
  console.log('Successfully generated transparent logo.png at:', pubPath, srcPath);

  await browser.close();
}

generateLogo().catch(err => {
  console.error(err);
  process.exit(1);
});

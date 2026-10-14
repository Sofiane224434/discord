import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = 'C:\\Users\\Sofia\\.gemini\\antigravity-ide\\brain\\5651068f-aa3b-432d-a862-61fd84458f69';

async function capture(url, filename, scroll = 0) {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2500));
    if (scroll > 0) {
      await page.evaluate((s) => window.scrollBy(0, s), scroll);
      await new Promise(r => setTimeout(r, 800));
    }
    await page.screenshot({ path: path.join(outputDir, filename), fullPage: false });
    console.log(`  -> Saved ${filename}`);
  } catch (err) {
    console.error(`  -> Error on ${url}: ${err.message}`);
  }
  await browser.close();
}

async function main() {
  // Public landing pages of popular bots
  await capture('https://mee6.xyz/', 'ref_mee6_home.png');
  await capture('https://mee6.xyz/', 'ref_mee6_home2.png', 800);
  await capture('https://www.draftbot.fr/', 'ref_draftbot_home.png');
  await capture('https://www.draftbot.fr/', 'ref_draftbot_home2.png', 700);
  await capture('https://carl.gg/', 'ref_carl_home.png');
  await capture('https://top.gg/', 'ref_topgg.png');
  console.log('Done!');
}

main();

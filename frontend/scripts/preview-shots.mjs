// scripts/preview-shots.mjs — captures d'écran du site lancé avec `npm run dev:mock`.
//
// Usage : node scripts/preview-shots.mjs <dossier> <route>[@largeur][~scrollY][|texte] ...
//   ex.   node scripts/preview-shots.mjs ./shots / /dashboard@390 "/status?mock_theme=islam" /~1200 "/dashboard/servers/111/config|Commandes"
// Sans ~scrollY : capture pleine page. Avec : capture de la fenêtre après défilement.
// |texte : clique d'abord sur le bouton ou lien dont le texte commence par « texte » (ex. un onglet).
//
// Variables : PREVIEW_URL (défaut http://localhost:5173), CHROME (chemin d'un Chrome/Chromium).
// Pour obtenir un Chrome headless : npx @puppeteer/browsers install chrome-headless-shell@stable
import path from 'node:path';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const [outDir, ...specs] = process.argv.slice(2);
if (!outDir || specs.length === 0) {
    console.error('Usage : node scripts/preview-shots.mjs <dossier> <route>[@largeur][~scrollY] ...');
    process.exit(1);
}

const base = process.env.PREVIEW_URL || 'http://localhost:5173';
const executablePath = process.env.CHROME;
if (!executablePath) {
    console.error('Définissez CHROME avec le chemin d’un Chrome/Chromium headless.');
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-gpu'] });

for (const spec of specs) {
    const [, route = '/', width = '1440', scrollY, click] = spec.match(/^([^@~|]*)(?:@(\d+))?(?:~(\d+))?(?:\|(.+))?$/) || [];
    const w = Number(width);
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: w < 600 ? 844 : 900 });
    page.on('pageerror', (e) => console.error(`[${route}] ${e.message}`));
    await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 30000 });

    if (click) {
        const clicked = await page.evaluate((label) => {
            const target = [...document.querySelectorAll('button, a')].find((el) => el.textContent.trim().startsWith(label));
            target?.click();
            return Boolean(target);
        }, click);
        if (!clicked) console.error(`[${route}] bouton « ${click} » introuvable`);
        await new Promise((r) => setTimeout(r, 400));
    }

    // Fait défiler la page pour déclencher les animations d'apparition
    await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
    });
    if (scrollY) await page.evaluate((y) => window.scrollTo(0, y), Number(scrollY));
    await new Promise((r) => setTimeout(r, 1500));

    const slug = `${route}${click ? `-${click}` : ''}`.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
    const name = `${slug}-${w}${scrollY ? `-s${scrollY}` : ''}.png`;
    await page.screenshot({ path: path.join(outDir, name), fullPage: !scrollY });
    console.log(name);
    await page.close();
}

await browser.close();

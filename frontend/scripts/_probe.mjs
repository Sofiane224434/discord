import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: process.env.CHROME, headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console', m.type(), m.text().slice(0, 300)); });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 500)));
p.on('requestfailed', (r) => console.log('FAILED', r.url(), r.failure()?.errorText));
for (const url of process.argv.slice(2)) {
  await p.goto(url, { waitUntil: 'networkidle0' });
  console.log(url, '-> root children:', await p.evaluate(() => document.getElementById('root').innerText.slice(0, 80).replace(/\n/g, ' | ')));
}
await p.goto('https://discord.azim404.com/docs/accueil', { waitUntil: 'networkidle0' });
await p.click('a[href="/status"]'); await new Promise(r => setTimeout(r, 1500));
await p.goBack(); await new Promise(r => setTimeout(r, 1500));
console.log('after back:', p.url(), await p.evaluate(() => document.getElementById('root').innerText.slice(0, 80).replace(/\n/g, ' | ')));
await b.close();

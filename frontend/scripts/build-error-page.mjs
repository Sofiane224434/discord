// Assemble la page « site indisponible » (502, 503, 504) servie par le nginx du VPS quand le site ne répond pas.
// Elle doit tenir en un seul fichier (logo et police intégrés) : à ce moment-là, le site lui-même est arrêté.
// Usage : node scripts/build-error-page.mjs  ->  deploy/errors/erreur-serveur.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read64 = (file) => fs.readFileSync(path.join(root, file)).toString('base64');

const html = fs.readFileSync(path.join(root, 'deploy/errors/erreur-serveur.template.html'), 'utf8')
    .replaceAll('{{LOGO}}', read64('public/icon.webp'))
    .replaceAll('{{FONT}}', read64('public/fonts/space-grotesk.woff2'));

fs.writeFileSync(path.join(root, 'deploy/errors/erreur-serveur.html'), html);
console.log(`deploy/errors/erreur-serveur.html (${Math.round(html.length / 1024)} Ko)`);

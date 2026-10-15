# Site AzimBot (discord.azim404.com) — règles du dépôt

Site et panel du bot Discord AzimBot (dépôt voisin `../azim-bot`). `frontend/` : React 19 + Vite + Tailwind, `backend/` : Express + MySQL, servis par un nginx en conteneur derrière le nginx du VPS.

## Déploiement

- Un push sur `main` déploie (GitHub Actions « Deploy Discord Dashboard »). `frontend/dist/` est versionné : lancer `npm run build` dans `frontend/` avant de committer.
- Si le bot change aussi : pousser le bot d'abord, attendre la fin de son déploiement (`gh run watch`), puis pousser le site. Deux déploiements en même temps cassent le réseau `azim-bot_default` (site en 502) ; en cas d'échec, `gh run rerun`.
- Pas de numéro de version pour le site (seul le bot en a un).
- Page « site indisponible » (502/503/504) : `frontend/deploy/errors/` (`node scripts/build-error-page.mjs` après modification du modèle). Réglages du nginx du VPS : `frontend/deploy/errors/host-nginx.conf`.

## Vérifier

- Aperçu connecté avec des données fictives : `npm run dev:mock` dans `frontend/` (API simulée `src/dev/mockApi.js`).
- Captures : `MSYS_NO_PATHCONV=1 CHROME=<chrome-headless-shell> node scripts/preview-shots.mjs <dossier> /route@largeur|onglet` (sans `MSYS_NO_PATHCONV`, Git Bash transforme `/route` en chemin Windows).
- Lint ciblé : `npx eslint <fichiers modifiés>` ; deux avertissements `exhaustive-deps` existaient déjà (Dashboard, GuildConfig).

## Code

- Textes : `frontend/public/locales/{fr,en}/translation.json` (les deux langues à chaque ajout) ; documentation : `frontend/src/content/docs/{fr,en}.js`.
- Données privées : l'API ne renvoie à chacun que les serveurs qu'il gère (`overviewFor` dans `backend/controllers/bot.controller.js`) ; ne jamais renvoyer de clé IA en clair ni de données d'un serveur non géré.
- Tout réglage d'une commande du bot doit aussi exister dans le panel.
- Activité Discord (`frontend/activite/`, `src/activity/`) : dans Discord, l'API s'appelle via `/.proxy/api`.

## Style (demandes explicites)

- Pas de pastilles « ● X · Y » au-dessus des titres, pas de barre colorée à gauche des éléments, pas d'emoji dans l'interface (icônes vectorielles de `components/Icon.jsx`).
- Premier écran : éviter les blocs coupés seulement par des ajustements compacts, jamais en repoussant le contenu.

# Contexte Projets - Prive (non versionne)

But de ce fichier:
- Centraliser les infos operationnelles utiles pour maintenir les projets.
- Garder les details reels d infrastructure hors du repo public.

## 1) Inventaire global

Identite GitHub:
- Username: sofiane224434

Acces SSH local:
- Alias: ssh azim-vps
- User: debian
- Port: 2222

VPS:
- OS: Debian 12
- Docker: actif
- Docker Compose: actif
- Reverse proxy en production: Nginx hote
- TLS: Certbot cote hote

## 2) Mapping projets actifs

Site principal:
- Repo: site_azim404
- Dossier local: C:\Users\Hp\Desktop\Git commit\azim404
- Dossier VPS: /home/debian/apps/azim404
- Conteneur: azim404
- Domaine: azim404.com, www.azim404.com
- Port local: 127.0.0.1:3001 -> 80

Portfolio:
- Repo: portfolio
- Dossier local: C:\Users\Hp\Desktop\Git commit\portfolio
- Dossier VPS: /home/debian/apps/portfolio
- Conteneur: portfolio
- Domaine: sofiane-kherarfa.azim404.com
- Port local: 127.0.0.1:3002 -> 80

Cinetech:
- Repo: cinetech
- Dossier local: C:\Users\Hp\Desktop\Git commit\cinetech
- Dossier VPS: /home/debian/apps/cinetech
- Domaine: moviedb.azim404.com
- Port local: 127.0.0.1:3003 -> 80
- Variables locales requises:
  - VITE_TMDB_API_KEY
  - VITE_TMDB_BASE_URL

Bot Discord:
- Repo: azim
- Dossier local: C:\Users\Hp\Desktop\Git commit\azim-bot
- Dossier VPS: /home/debian/apps/azim-bot
- Conteneur: azim-bot
- Service compose: azim-bot
- Fichiers locaux a preserver:
  - .env
  - bot-config.json
  - user-memory.json

## 3) Convention de deploiement retenue

Par repo:
- 1 workflow GitHub Actions
- 1 dossier VPS dedie
- deploiement par git fetch/reset/clean puis docker compose up -d --build

Regle:
- Ne jamais arreter des conteneurs hors du projet cible.

## 4) Verifications rapides utiles

Etat des stacks:
```bash
ssh azim-vps "docker compose ls"
```

Etat d un projet:
```bash
ssh azim-vps "cd /home/debian/apps/azim404 && docker compose ps"
ssh azim-vps "cd /home/debian/apps/portfolio && docker compose ps"
ssh azim-vps "cd /home/debian/apps/azim-bot && docker compose ps"
ssh azim-vps "cd /home/debian/apps/cinetech && docker compose ps"
```

Check HTTP public:
```bash
curl -I https://azim404.com
curl -I https://sofiane-kherarfa.azim404.com
curl -I https://moviedb.azim404.com
```

## 5) Risques deja rencontres

- Traefik et volumes Caddy supprimes le 17/03/2026 (legacy nettoye).
- nginx.conf du conteneur azim404 corrige le 17/03/2026 (suppression SSL interne, SSL gere par Nginx hote).
- Secrets presents dans des fichiers suivis par git.
- Workflows qui pull sans clean et laissent des etats sales.
- Deploy d un projet qui casse un autre projet.

## 6) Bonnes pratiques a conserver

- Garder ce fichier prive et local.
- Maintenir un .env.example dans chaque repo public.
- Documenter la realite de la prod, pas une architecture theorique.
- Mettre a jour ce contexte apres chaque changement infra important.

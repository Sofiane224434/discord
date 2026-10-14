// dev/mockApi.js — fausse API pour prévisualiser tout le site sans backend ni compte.
// Chargé uniquement par `npm run dev:mock` (import.meta.env.DEV + VITE_MOCK_API=1) : jamais présent en production.
//
// Paramètres d'URL utiles :
//   ?mock_user=0      -> visiteur non connecté
//   ?mock_theme=islam -> thème islam débloqué et actif
//   ?mock_empty=1     -> comptes vides (aucun serveur, aucun retour)

const now = Date.now();
const ago = (minutes) => new Date(now - minutes * 60_000).toISOString();

let USER = { id: 1, username: 'claude-apercu', firstname: 'Claude', email: null, createdAt: '2026-03-02T10:00:00Z', avatarUrl: '/icon.png', hasDiscord: true, hasPassword: false, recentDiscordAuth: true, role: new URLSearchParams(window.location.search).get('mock_role') || 'superadmin' };

const DISCORD_GUILDS = [
    { id: '111', name: 'Azim HQ', owner: true, permissions: '8', iconUrl: '/icon.png' },
    { id: '112', name: 'Studio Créa', owner: false, permissions: '32', iconUrl: '/icon-islam.png' },
    { id: '113', name: 'Les Codeurs', owner: true, permissions: '8' },
    { id: '333', name: 'Projet Perso', owner: true, permissions: '8' },
    { id: '222', name: 'Gaming FR', owner: false, permissions: '0' },
];

function overview(islam, empty) {
    const guilds = empty ? [] : [
        { id: '111', name: 'Azim HQ', memberCount: 842, islamModeEnabled: islam, observability: { commandByName: { ask: 40, rank: 22, purge: 5, priere: 12, help: 9, quiz: 7 }, recentErrors: [{ ts: ago(42), type: 'CommandError', message: 'Missing Permissions dans #annonces' }, { ts: ago(180), type: 'GroqTimeout', message: 'Le modèle a mis trop de temps à répondre' }], errorTotal: 3 } },
        { id: '112', name: 'Studio Créa', memberCount: 1290, observability: { commandByName: { ask: 18, youtube: 4 } } },
        { id: '113', name: 'Les Codeurs', memberCount: 311, observability: { commandByName: { ask: 25, code: 14 } } },
        { id: '222', name: 'Gaming FR', memberCount: 520, publicInviteUrl: 'https://discord.gg/exemple' },
        { id: '444', name: 'Club Lecture', memberCount: 95 },
    ];
    return {
        bot: { status: 'online', latency: 42, uptime: 93_000 },
        stats: { guildCount: guilds.length, memberCount: guilds.reduce((n, g) => n + g.memberCount, 0), commandCount24h: empty ? 0 : 87 },
        guilds,
    };
}

const GUILD_CONFIG = {
    channels: [{ id: 'c1', name: 'général' }, { id: 'c2', name: 'annonces' }, { id: 'c3', name: 'logs' }],
    roles: [{ id: 'r1', name: 'Modo' }, { id: 'r2', name: 'Membre' }],
    commands: [
        { name: 'ask', description: 'Pose une question à l’IA', enabled: true },
        { name: 'rank', description: 'Affiche ton niveau', enabled: true },
        { name: 'purge', description: 'Supprime des messages', enabled: false },
    ],
    rank: { enabled: true, announceChannelId: 'c1', rewards: [{ level: 5, roleId: 'r2' }] },
    welcome: { enabled: true, channelId: 'c1' },
    youtube: { channels: ['UCWeg2Pkate69NFdBeuRFTAw', 'UCxxxxxxxxxxxxxxxxxxxxxx'], profiles: [{ id: 'UCWeg2Pkate69NFdBeuRFTAw', name: 'SQUEEZIE', handle: '@Squeezie', avatarUrl: '/icon.png', url: 'https://www.youtube.com/@Squeezie' }, { id: 'UCxxxxxxxxxxxxxxxxxxxxxx', name: null, handle: null, avatarUrl: null, url: 'https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx' }], targetChannelId: 'c2' },
    tiktok: { enabled: true, username: 'khaby.lame', accounts: ['khaby.lame'], profiles: [{ id: 'khaby.lame', name: 'Khabane lame', handle: '@khaby.lame', avatarUrl: '/icon-islam.png', url: 'https://www.tiktok.com/@khaby.lame' }], targetChannelId: 'c2' },
};

let reports = [
    { id: 'RPT-1042', type: 'bug', status: 'in_progress', title: 'La radio s’arrête après 20 minutes', description: 'Sur le salon vocal #coran, la radio se coupe toute seule au bout de ~20 min. Il faut relancer /radio.', authorName: 'Yanis', source: 'discord', guildName: 'Azim HQ', createdAt: ago(60 * 26) },
    { id: 'RPT-1041', type: 'suggestion', status: 'open', title: 'Ajouter une commande météo', description: 'Une commande /meteo <ville> qui affiche la météo du jour serait super pratique.', authorName: 'Inès', source: 'web', createdAt: ago(60 * 50), reply: { text: 'Bonne idée, on la prévoit pour la prochaine version.', at: ago(60) } },
    { id: 'RPT-1038', type: 'bug', status: 'resolved', title: 'Le message de bienvenue mentionne deux fois', description: 'Le membre est mentionné deux fois quand le message privé est activé.', authorName: 'Sami', source: 'web', createdAt: ago(60 * 24 * 6) },
    { id: 'RPT-1033', type: 'suggestion', status: 'resolved', title: 'Alertes de lives TikTok', description: 'Prévenir quand un créateur lance un live TikTok.', authorName: 'Léa', source: 'discord', guildName: 'Studio Créa', createdAt: ago(60 * 24 * 12) },
];

const STAFF_USERS = [
    { id: 1, username: 'claude-apercu', email: 'sofiane.kherarfa@laplateforme.io', role: 'superadmin', isOwner: true, createdAt: '2026-03-02T10:00:00Z', discordId: '1001' },
    { id: 2, username: 'ines', email: 'ines@example.com', role: 'admin', createdAt: '2026-05-11T10:00:00Z', discordId: '1002' },
    { id: 3, username: 'yanis', email: 'yanis@example.com', role: 'user', createdAt: '2026-06-20T10:00:00Z' },
    { id: 4, username: 'spam-bot', email: 'spam@example.com', role: 'user', banned: true, banReason: 'Spam dans les retours', createdAt: '2026-09-01T10:00:00Z' },
];

const MOCK_COMMANDS = [
    { name: 'mod', islamic: false, fr: { name: 'mod', description: 'Outils de modération : sanctions, avertissements et salons', options: [
        { name: 'bannir', type: 1, description: 'Bannir un membre du serveur', options: [{ name: 'membre', type: 6, required: true, description: 'Membre concerné' }, { name: 'raison', type: 3, description: 'Raison (visible dans le journal de modération)' }] },
        { name: 'exclure', type: 1, description: 'Exclure temporairement un membre', options: [{ name: 'duree', type: 4, required: true, description: 'Durée de l’exclusion', choices: ['60 secondes', '5 minutes', '1 heure', '1 jour'] }] },
    ] }, en: { name: 'mod', description: 'Moderation tools: sanctions, warnings and channels', options: [{ name: 'ban', type: 1, description: 'Ban a member from the server', options: [{ name: 'member', type: 6, required: true, description: 'Member concerned' }] }] } },
    { name: 'purge', islamic: false, fr: { name: 'purge', description: 'Supprimer des messages ou vider entièrement un salon', options: [{ name: 'messages', type: 1, description: 'Supprimer jusqu’à 1000 messages', options: [{ name: 'nombre', type: 4, required: true, description: 'Nombre de messages (1 à 1000)' }] }, { name: 'salon', type: 1, description: 'Vider entièrement ce salon' }] }, en: { name: 'purge', description: 'Delete messages or fully clear a channel', options: [] } },
    { name: 'ping', islamic: false, fr: { name: 'ping', description: 'Teste la latence du bot', options: [] }, en: { name: 'ping', description: 'Check the bot’s latency', options: [] } },
    { name: 'coran', islamic: true, fr: { name: 'coran', description: 'Consulter le Noble Coran', options: [] }, en: { name: 'quran', description: 'Read the Noble Quran', options: [] } },
];

function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function installMockApi() {
    const params = new URLSearchParams(window.location.search);
    const loggedIn = params.get('mock_user') !== '0';
    const islam = params.get('mock_theme') === 'islam';
    const empty = params.get('mock_empty') === '1';

    if (loggedIn) {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('discord_guilds', JSON.stringify(empty ? [] : DISCORD_GUILDS));
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('discord_guilds');
    }
    if (params.has('mock_theme')) {
        localStorage.setItem('azim_theme_choice', islam ? 'islam' : 'cyber');
    }
    if (empty) reports = [];

    const realFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
        const url = new URL(typeof input === 'string' ? input : input.url, window.location.origin);
        if (!url.pathname.startsWith('/api/')) return realFetch(input, init);

        const method = (init.method || 'GET').toUpperCase();
        const path = url.pathname.replace(/^\/api/, '');
        await new Promise((r) => setTimeout(r, 120));

        if (path === '/auth/me' && method === 'GET') return loggedIn ? json({ user: USER }) : json({ error: 'Non connecté' }, 401);
        if (path === '/auth/me' && method === 'DELETE') return json({ message: 'Compte supprimé.' });
        if (path === '/auth/email') {
            USER = { ...USER, email: JSON.parse(init.body || '{}').email };
            return json({ message: 'Adresse email mise à jour.', user: USER });
        }
        if (path === '/auth/password') {
            USER = { ...USER, hasPassword: true };
            return json({ message: 'Mot de passe enregistré.' });
        }
        if (path === '/bot/overview') return json(overview(islam, empty));
        if (/^\/admin\/guild\/[^/]+\/config$/.test(path)) return json(method === 'GET' ? GUILD_CONFIG : { success: true });
        if (path === '/system/health') {
            return json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: { db: { status: 'ok' }, botApi: { status: 'ok', responseMs: 38, uptimeSeconds: 93_000, discord: { ready: true, ping: 41, guildCount: 4, shardCount: 1, shards: [{ id: 0, ping: 41, ready: true }] } }, oauth: { status: 'ok' } },
            });
        }
        if (path === '/feedback' && method === 'GET') return json({ reports, scope: loggedIn ? 'all' : 'guest' });
        if (path === '/feedback' && method === 'POST') {
            const body = JSON.parse(init.body || '{}');
            const report = { ...body, id: `RPT-${1043 + reports.length}`, status: 'open', source: 'web', createdAt: new Date().toISOString() };
            reports = [report, ...reports];
            return json({ success: true, report });
        }
        const feedbackMatch = path.match(/^\/feedback\/([^/]+)$/);
        if (feedbackMatch && method === 'PATCH') {
            const body = JSON.parse(init.body || '{}');
            reports = reports.map((r) => (r.id === feedbackMatch[1] ? { ...r, ...(body.status ? { status: body.status } : {}), ...(body.reply !== undefined ? { reply: body.reply ? { text: body.reply, at: new Date().toISOString() } : null } : {}) } : r));
            return json({ success: true, report: reports.find((r) => r.id === feedbackMatch[1]) });
        }
        if (feedbackMatch && method === 'DELETE') {
            reports = reports.filter((r) => r.id !== feedbackMatch[1]);
            return json({ success: true });
        }
        if (path === '/staff/users') return json({ users: STAFF_USERS });
        if (path === '/staff/guilds') return json({ guilds: overview(islam, empty).guilds.map((g) => ({ ...g, iconUrl: null, suspended: g.id === '444' })) });
        if (path.startsWith('/staff/')) return json({ success: true, user: STAFF_USERS[1] });
        if (path === '/system/commands') return json({ commands: MOCK_COMMANDS });
        if (path === '/discord/bot-invite') return json({ url: 'https://discord.com/oauth2/authorize' });
        return json({});
    };

    console.info('[mock] API simulée active — utilisateur :', loggedIn ? USER.username : 'visiteur');
}

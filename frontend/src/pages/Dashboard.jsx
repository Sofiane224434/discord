import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { botService, discordService } from '../services/api.js';
import Icon from '../components/Icon.jsx';

function hasManageGuildPermission(guild) {
    if (guild?.owner) return true;
    try {
        return (BigInt(guild?.permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

function formatUptime(seconds = 0) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    if (days) return `${days}j ${hours}h`;
    if (hours) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getDiscordGuildIcon(guild) {
    if (guild.iconUrl) return guild.iconUrl;
    if (guild.icon) return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`;
    return null;
}

function Dashboard() {
    const { user } = useAuth();
    const { setIsIslamUnlocked } = useTheme();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteLoading, setInviteLoading] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await botService.getOverview();
            setOverview(data);
            setError('');

            // "Dès qu'il y a un serveur en mode islam tu as le thème islam directement"
            const hasIslamActive = (data?.guilds || []).some((bg) => bg.islamModeEnabled);
            if (hasIslamActive) {
                setIsIslamUnlocked(true);
            }
        } catch (apiError) {
            setError(apiError.message || 'Impossible de charger les données du bot.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, setIsIslamUnlocked]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const discordGuilds = useMemo(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('discord_guilds') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, []);

    const bot = overview?.bot || {};
    const stats = overview?.stats || {};
    const connectedGuildIds = useMemo(() => new Set((overview?.guilds || []).map((guild) => String(guild.id))), [overview]);
    // Map de tous les serveurs Discord de l'utilisateur (avec ses permissions réelles)
    const userGuildMap = useMemo(() => {
        const map = new Map();
        for (const g of discordGuilds) {
            map.set(String(g.id), {
                ...g,
                id: String(g.id),
                canManage: hasManageGuildPermission(g),
            });
        }
        return map;
    }, [discordGuilds]);

    // 1. Serveurs à gérer : Perm de gérer ET Bot présent
    const manageableGuilds = useMemo(() => {
        const result = [];
        for (const g of userGuildMap.values()) {
            if (g.canManage && connectedGuildIds.has(g.id)) {
                const botGuild = (overview?.guilds || []).find((bg) => String(bg.id) === g.id);
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || botGuild?.iconUrl || getDiscordGuildIcon(g),
                    memberCount: g.memberCount || botGuild?.memberCount || null,
                    connected: true,
                    canManage: true,
                });
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds, overview]);

    // Commandes les plus utilisées (strictement isolées aux serveurs gérés par cet utilisateur)
    const topCommands = useMemo(() => {
        const counts = {};
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            const cMap = bg?.observability?.commandByName || {};
            for (const [cmd, count] of Object.entries(cMap)) {
                counts[cmd] = (counts[cmd] || 0) + Number(count || 0);
            }
        }
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .filter((c) => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [manageableGuilds, overview]);

    // Erreurs récentes (strictement isolées aux serveurs gérés par cet utilisateur)
    const recentErrors = useMemo(() => {
        const errors = [];
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            const list = Array.isArray(bg?.observability?.recentErrors) ? bg.observability.recentErrors : [];
            errors.push(...list);
        }
        return errors
            .sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0))
            .slice(0, 5);
    }, [manageableGuilds, overview]);

    const errorTotal = useMemo(() => {
        let total = 0;
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            total += Number(bg?.observability?.errorTotal || 0);
        }
        return total;
    }, [manageableGuilds, overview]);

    const maxCommandCount = Math.max(1, ...topCommands.map((command) => Number(command.count || 0)));

    // 2. Autres serveurs où le bot est présent : Bot présent mais SANS perm de gestion
    const otherBotGuilds = useMemo(() => {
        const result = [];
        const addedIds = new Set(manageableGuilds.map((g) => g.id));

        // Serveurs de l'utilisateur où le bot est connecté mais sans permission de gestion
        for (const g of userGuildMap.values()) {
            if (!addedIds.has(g.id) && connectedGuildIds.has(g.id)) {
                const botGuild = (overview?.guilds || []).find((bg) => String(bg.id) === g.id);
                // Si le serveur a le mode islam actif et que l'utilisateur n'a aucun droit dessus, masqué
                if (botGuild?.islamModeEnabled || g.id === '1283533269047971894') {
                    continue;
                }
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || botGuild?.iconUrl || getDiscordGuildIcon(g),
                    memberCount: g.memberCount || botGuild?.memberCount || null,
                    connected: true,
                    canManage: false,
                    isMember: true,
                });
                addedIds.add(g.id);
            }
        }

        // Serveurs connectés au bot non répertoriés dans les serveurs de session
        if (Array.isArray(overview?.guilds)) {
            for (const bg of overview.guilds) {
                const id = String(bg.id);
                // Si le serveur a le mode islam et que l'utilisateur n'a aucun droit de gestion, masqué du site
                if (bg.islamModeEnabled || id === '1283533269047971894') {
                    continue;
                }
                if (!addedIds.has(id)) {
                    result.push({
                        id,
                        name: bg.name,
                        iconUrl: bg.iconUrl,
                        memberCount: bg.memberCount,
                        connected: true,
                        canManage: false,
                        fromBotList: true,
                    });
                    addedIds.add(id);
                }
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds, manageableGuilds, overview]);

    // 3. Serveurs où l'utilisateur a la perm de gérer, mais le bot n'est pas encore présent (à inviter)
    const inviteableGuilds = useMemo(() => {
        const result = [];
        for (const g of userGuildMap.values()) {
            if (g.canManage && !connectedGuildIds.has(g.id)) {
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || getDiscordGuildIcon(g),
                    connected: false,
                    canManage: true,
                });
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds]);

    const totalConnectedCount = Math.max(
        Number(stats.guildCount || 0),
        overview?.guilds?.length || 0,
        connectedGuildIds.size
    );

    const [serverTab, setServerTab] = useState('manage');

    const cards = [
        { label: 'Serveurs', value: totalConnectedCount.toLocaleString('fr-FR'), detail: 'avec Azim installé', icon: 'server' },
        { label: 'Membres', value: Number(stats.memberCount || 0).toLocaleString('fr-FR'), detail: 'touchés par le bot', icon: 'users' },
        { label: 'Commandes', value: Number(stats.commandCount24h || 0).toLocaleString('fr-FR'), detail: 'ces dernières 24 h', icon: 'terminal' },
        { label: 'Latence', value: `${Math.max(0, Number(bot.latency || 0))} ms`, detail: `en ligne depuis ${formatUptime(bot.uptime)}`, icon: 'activity' },
    ];

    const inviteBot = async (guildId) => {
        setInviteLoading(guildId);
        try {
            const invite = await discordService.getBotInviteUrl(guildId);
            window.open(invite.url, '_blank', 'noopener,noreferrer');
        } catch {
            setError('Impossible de préparer le lien d’invitation.');
        } finally {
            setInviteLoading(null);
        }
    };

    const serverTabs = [
        { id: 'manage', label: 'À gérer', list: manageableGuilds },
        { id: 'invite', label: 'À inviter', list: inviteableGuilds },
        { id: 'other', label: 'Autres serveurs', list: otherBotGuilds },
    ];
    const currentTab = serverTabs.find((tab) => tab.id === serverTab) || serverTabs[0];
    const isOnline = bot.status === 'online';
    const displayName = user?.firstname || user?.username;

    const renderGuildCard = (guild) => {
        const icon = getDiscordGuildIcon(guild);
        const initial = (guild.name || '?').slice(0, 1).toUpperCase();
        return (
            <article className={`pnl-guild${guild.connected ? '' : ' is-pending'}`} key={guild.id}>
                <div className="pnl-guild__banner" style={icon ? { backgroundImage: `url(${icon})` } : undefined} />
                <div className="pnl-guild__body">
                    {icon ? <img className="pnl-guild__icon" src={icon} alt="" /> : <span className="pnl-guild__icon pnl-guild__icon--fallback">{initial}</span>}
                    <h3 title={guild.name}>{guild.name}</h3>
                    <p>
                        {guild.connected
                            ? (guild.memberCount ? `${Number(guild.memberCount).toLocaleString('fr-FR')} membres` : 'Azim installé')
                            : 'Azim pas encore installé'}
                    </p>
                    {guild.connected && guild.canManage ? (
                        <Link to={`/dashboard/servers/${guild.id}/config`} className="pnl-btn pnl-btn--primary">
                            Configurer <Icon name="arrowRight" size={16} />
                        </Link>
                    ) : null}
                    {!guild.connected ? (
                        <button type="button" onClick={() => inviteBot(guild.id)} disabled={inviteLoading === guild.id} className="pnl-btn">
                            <Icon name="plus" size={16} /> {inviteLoading === guild.id ? 'Ouverture…' : 'Ajouter Azim'}
                        </button>
                    ) : null}
                    {guild.connected && !guild.canManage ? (
                        <span className="pnl-guild__note">Lecture seule · permission « Gérer le serveur » requise</span>
                    ) : null}
                </div>
            </article>
        );
    };

    return (
        <main className="pnl">
            <header className="pnl-head">
                <div className="pnl-head__who">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="pnl-head__avatar" /> : (
                        <span className="pnl-head__avatar pnl-head__avatar--fallback">{(displayName || 'A').charAt(0).toUpperCase()}</span>
                    )}
                    <div>
                        <h1>{displayName ? `Bonjour ${displayName}` : 'Vos serveurs'}</h1>
                        <p className={`pnl-head__status${isOnline ? ' is-online' : ''}`}>
                            <i />
                            {loading ? 'Connexion au bot…' : isOnline ? `Azim est en ligne · ${Math.max(0, Number(bot.latency || 0))} ms` : 'Azim est actuellement indisponible'}
                        </p>
                    </div>
                </div>
                <div className="pnl-head__actions">
                    <Link to="/login" className="pnl-btn pnl-btn--ghost" title="Recharger la liste de vos serveurs depuis Discord">
                        Resynchroniser Discord
                    </Link>
                    <button type="button" onClick={loadData} disabled={refreshing} className="pnl-btn">
                        <Icon name="refresh" size={16} className={refreshing ? 'pnl-spin' : ''} /> {refreshing ? 'Actualisation…' : 'Actualiser'}
                    </button>
                </div>
            </header>

            {error ? <div role="alert" className="pnl-alert"><Icon name="alert" size={18} /> {error}</div> : null}

            <section className="pnl-stats" aria-label="Statistiques du bot">
                {cards.map((card) => (
                    <article className="pnl-stat" key={card.label}>
                        <span className="pnl-stat__icon"><Icon name={card.icon} size={20} /></span>
                        <div>
                            <small>{card.label}</small>
                            <strong>{loading ? '—' : card.value}</strong>
                            <span>{loading ? 'lecture des données…' : card.detail}</span>
                        </div>
                    </article>
                ))}
            </section>

            <div className="pnl-grid">
                <section className="pnl-card pnl-servers">
                    <div className="pnl-card__head">
                        <h2>Serveurs</h2>
                        <div className="pnl-tabs" role="tablist">
                            {serverTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={serverTab === tab.id}
                                    className={`pnl-tab${serverTab === tab.id ? ' is-active' : ''}`}
                                    onClick={() => setServerTab(tab.id)}
                                >
                                    {tab.label} <span>{tab.list.length}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {currentTab.list.length ? (
                        <div className="pnl-guilds">{currentTab.list.map(renderGuildCard)}</div>
                    ) : (
                        <div className="pnl-empty">
                            <Icon name="server" size={28} />
                            {currentTab.id === 'manage' ? (
                                <>
                                    <p>Azim n’est installé sur aucun serveur que vous administrez.</p>
                                    {inviteableGuilds.length ? (
                                        <button type="button" className="pnl-btn pnl-btn--primary" onClick={() => setServerTab('invite')}>Voir les serveurs à inviter</button>
                                    ) : (
                                        <Link to="/login" className="pnl-btn">Resynchroniser mes serveurs Discord</Link>
                                    )}
                                </>
                            ) : currentTab.id === 'invite' ? (
                                <p>Azim est déjà présent sur tous vos serveurs administrables.</p>
                            ) : (
                                <p>Aucun autre serveur en commun avec Azim.</p>
                            )}
                        </div>
                    )}
                </section>

                <aside className="pnl-side">
                    <section className="pnl-card">
                        <div className="pnl-card__head">
                            <h2>Commandes populaires</h2>
                            <Link to="/command-history" className="pnl-link">Historique <Icon name="arrowRight" size={14} /></Link>
                        </div>
                        {topCommands.length ? (
                            <ol className="pnl-bars">
                                {topCommands.map((command) => (
                                    <li key={command.name}>
                                        <div className="pnl-bars__label">
                                            <code>/{command.name}</code>
                                            <strong>{Number(command.count || 0).toLocaleString('fr-FR')}</strong>
                                        </div>
                                        <span className="pnl-bars__track"><i style={{ width: `${Math.max(4, (Number(command.count || 0) / maxCommandCount) * 100)}%` }} /></span>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="pnl-muted">Les commandes apparaîtront ici après leurs premières utilisations.</p>}
                    </section>

                    <section className="pnl-card">
                        <div className="pnl-card__head">
                            <h2>Erreurs récentes</h2>
                            <span className="pnl-count">{Number(errorTotal || 0)} au total</span>
                        </div>
                        {recentErrors.length ? (
                            <ul className="pnl-errors">
                                {recentErrors.map((item, index) => (
                                    <li key={`${item.ts}-${index}`}>
                                        <span className="pnl-errors__icon"><Icon name="alert" size={15} /></span>
                                        <div>
                                            <strong>{item.type || 'Erreur'}</strong>
                                            <small>{String(item.message || '').slice(0, 90)}</small>
                                        </div>
                                        <time>{item.ts ? new Date(item.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="pnl-muted pnl-ok"><Icon name="check" size={16} /> Aucune erreur récente.</p>
                        )}
                    </section>
                </aside>
            </div>

            <nav className="pnl-shortcuts" aria-label="Raccourcis">
                <Link to="/docs/accueil"><Icon name="book" size={20} /><span><strong>Documentation</strong><small>Guides et modules</small></span></Link>
                <Link to="/docs/commandes"><Icon name="terminal" size={20} /><span><strong>Commandes</strong><small>Liste complète</small></span></Link>
                <Link to="/feedback"><Icon name="bug" size={20} /><span><strong>Retours & bugs</strong><small>Signaler un problème</small></span></Link>
                <a href="https://discord.gg/azim" target="_blank" rel="noreferrer"><Icon name="lifebuoy" size={20} /><span><strong>Support</strong><small>Serveur Discord</small></span></a>
            </nav>
        </main>
    );
}

export default Dashboard;
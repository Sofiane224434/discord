import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { botService, discordService } from '../services/api.js';

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
        } catch (apiError) {
            setError(apiError.message || 'Impossible de charger les données du bot.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

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
    const observability = overview?.observability || {};
    const connectedGuildIds = useMemo(() => new Set((overview?.guilds || []).map((guild) => String(guild.id))), [overview]);
    const guildListIsFresh = overview?.source === 'api' && !overview?.isStale;
    const topCommands = (observability.topCommands || []).slice(0, 6);
    const recentErrors = Array.isArray(observability.recentErrors) ? observability.recentErrors.slice(0, 5) : [];
    const maxCommandCount = Math.max(1, ...topCommands.map((command) => Number(command.count || 0)));

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

    // 2. Autres serveurs où le bot est présent : Bot présent mais SANS perm de gestion
    const otherBotGuilds = useMemo(() => {
        const result = [];
        const addedIds = new Set(manageableGuilds.map((g) => g.id));

        // Serveurs de l'utilisateur où le bot est connecté mais sans permission de gestion
        for (const g of userGuildMap.values()) {
            if (!addedIds.has(g.id) && connectedGuildIds.has(g.id)) {
                const botGuild = (overview?.guilds || []).find((bg) => String(bg.id) === g.id);
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

    const cards = [
        { label: 'Serveurs', value: totalConnectedCount.toLocaleString(), detail: 'connectés au bot', marker: '01' },
        { label: 'Membres', value: Number(stats.memberCount || 0).toLocaleString(), detail: 'sur les serveurs', marker: '02' },
        { label: 'Commandes · 24 h', value: Number(stats.commandCount24h || 0).toLocaleString(), detail: 'exécutées', marker: '03' },
        { label: 'Disponibilité', value: bot.status === 'online' ? 'En ligne' : 'Hors ligne', detail: `latence ${Math.max(0, Number(bot.latency || 0))} ms`, marker: '04' },
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

    return (
        <main className="ops-dashboard">
            <div className="ops-page-heading">
                <div>
                        <p className="site-eyebrow">PANEL AZIM</p>
                        <h1>{user?.firstname ? `Bonjour ${user.firstname}` : 'Vos serveurs'}</h1>
                        <p className="site-muted">Choisissez un serveur pour voir son état ou modifier ses réglages.</p>
                </div>
                <div className="ops-heading-actions">
                    <Link to="/login" className="ops-action-button">Actualiser Discord</Link>
                    <button type="button" onClick={loadData} disabled={refreshing} className="ops-action-button">
                        {refreshing ? 'Actualisation…' : 'Actualiser'}
                    </button>
                    <span className={`ops-status-chip ${bot.status === 'online' ? 'ops-status-online' : 'ops-status-offline'}`}>
                        <span /> {bot.status === 'online' ? 'Bot actif' : loading ? 'Connexion…' : 'Bot indisponible'}
                    </span>
                    <Link to="/status" className="ops-icon-link" title="État des services" aria-label="État des services">⚙</Link>
                </div>
            </div>

            {error ? <div role="alert" className="ops-alert">{error}</div> : null}

            <section className="ops-metric-grid" aria-label="Statistiques du bot">
                {cards.map((card) => (
                    <article className="ops-metric site-panel" key={card.label}>
                        <div className="ops-metric-head"><span className="ops-metric-symbol">{card.marker}</span><span>{card.label}</span></div>
                        <strong className={card.label === 'Disponibilité' ? (bot.status === 'online' ? 'ops-value-online' : 'ops-value-offline') : ''}>{loading ? '—' : card.value}</strong>
                        <small>{loading ? 'lecture des données' : card.detail}</small>
                    </article>
                ))}
            </section>

            <div className="ops-main-grid">
                <div className="ops-servers-column flex flex-col gap-4">
                    {/* Section 1 : Serveurs à gérer */}
                    <section className="ops-panel site-panel">
                        <div className="ops-panel-heading">
                            <div>
                                <p className="site-eyebrow">VOS ACCÈS</p>
                                <h2>Serveurs à gérer</h2>
                            </div>
                            <span className="ops-count">
                                {manageableGuilds.length} serveur(s)
                            </span>
                        </div>
                        {manageableGuilds.length ? (
                            <>
                                <div className="ops-table-head"><span>Serveur</span><span>Bot</span><span>Membres</span><span>Configuration</span></div>
                                <div className="ops-server-list">
                                    {manageableGuilds.map((guild) => {
                                        const icon = getDiscordGuildIcon(guild);
                                        return (
                                            <article className="ops-server-row" key={guild.id}>
                                                <div className="ops-server-identity">
                                                    {icon ? <img src={icon} alt="" /> : <span className="ops-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                    <span>{guild.name}</span>
                                                </div>
                                                <span className="ops-server-status is-connected"><i />Installé</span>
                                                <span className="ops-server-members">{guild.memberCount ? Number(guild.memberCount).toLocaleString() : '—'}</span>
                                                <div className="ops-server-actions">
                                                    <Link to={`/dashboard/servers/${guild.id}/config`} className="ops-action-button">Configurer <span aria-hidden="true">↗</span></Link>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="ops-empty-state">
                                <p>Aucun serveur où vous avez les permissions de gestion n'a Azim installé actuellement.</p>
                                {inviteableGuilds.length > 0 ? (
                                    <p className="site-muted text-xs mt-2">Vous pouvez ajouter le bot à vos serveurs administrables dans la section ci-dessous.</p>
                                ) : (
                                    <Link to="/login" className="site-link">Actualiser vos permissions Discord →</Link>
                                )}
                            </div>
                        )}
                        <div className="ops-server-footer">
                            <span>Disponibilité globale <strong>{bot.status === 'online' ? 'Opérationnelle' : 'À vérifier'}</strong></span>
                            <span>Depuis le redémarrage <strong>{formatUptime(bot.uptime)}</strong></span>
                        </div>
                    </section>

                    {/* Section 2 : Autres serveurs avec Azim */}
                    {otherBotGuilds.length > 0 && (
                        <section className="ops-panel site-panel">
                            <div className="ops-panel-heading">
                                <div>
                                    <p className="site-eyebrow">COMMUNAUTÉS AZIM</p>
                                    <h2>Autres serveurs avec Azim</h2>
                                </div>
                                <span className="ops-count">
                                    {otherBotGuilds.length} serveur(s)
                                </span>
                            </div>
                            <div className="ops-table-head"><span>Serveur</span><span>Bot</span><span>Membres</span><span>Statut</span></div>
                            <div className="ops-server-list">
                                {otherBotGuilds.map((guild) => {
                                    const icon = getDiscordGuildIcon(guild);
                                    return (
                                        <article className="ops-server-row" key={guild.id}>
                                            <div className="ops-server-identity">
                                                {icon ? <img src={icon} alt="" /> : <span className="ops-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                <span>{guild.name}</span>
                                            </div>
                                            <span className="ops-server-status is-connected"><i />En ligne</span>
                                            <span className="ops-server-members">{guild.memberCount ? Number(guild.memberCount).toLocaleString() : '—'}</span>
                                            <div className="ops-server-actions">
                                                <span className="ops-action-hint">Permission requise pour gérer</span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Section 3 : Serveurs disponibles pour invitation */}
                    {inviteableGuilds.length > 0 && (
                        <section className="ops-panel site-panel" style={{ opacity: 0.95 }}>
                            <div className="ops-panel-heading">
                                <div>
                                    <p className="site-eyebrow">INVITATION</p>
                                    <h2>Ajouter Azim à d'autres serveurs</h2>
                                </div>
                                <span className="ops-count">
                                    {inviteableGuilds.length} disponible(s)
                                </span>
                            </div>
                            <div className="ops-table-head"><span>Serveur</span><span>Bot</span><span>Membres</span><span>Action</span></div>
                            <div className="ops-server-list">
                                {inviteableGuilds.map((guild) => {
                                    const icon = getDiscordGuildIcon(guild);
                                    return (
                                        <article className="ops-server-row" key={guild.id}>
                                            <div className="ops-server-identity">
                                                {icon ? <img src={icon} alt="" /> : <span className="ops-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                <span>{guild.name}</span>
                                            </div>
                                            <span className="ops-server-status is-disconnected"><i />Non installé</span>
                                            <span className="ops-server-members">—</span>
                                            <div className="ops-server-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => inviteBot(guild.id)}
                                                    disabled={inviteLoading === guild.id}
                                                    className="ops-action-button"
                                                >
                                                    {inviteLoading === guild.id ? 'Ouverture…' : 'Ajouter le bot'}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="ops-side-column">
                    <section className="ops-panel site-panel ops-analytics-panel">
                        <div className="ops-panel-heading">
                            <div><p className="site-eyebrow">UTILISATION</p><h2>Commandes les plus utilisées</h2></div>
                            <Link to="/command-history" className="site-link text-xs">Tout voir →</Link>
                        </div>
                        {topCommands.length ? (
                            <div className="ops-command-chart">
                                {topCommands.map((command, index) => (
                                    <div className="ops-command-bar-row" key={command.name}>
                                        <span className="ops-command-rank">{String(index + 1).padStart(2, '0')}</span>
                                        <span className="ops-command-name">/{command.name}</span>
                                        <span className="ops-command-track"><i style={{ width: `${Math.max(5, (Number(command.count || 0) / maxCommandCount) * 100)}%` }} /></span>
                                        <strong>{Number(command.count || 0).toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="ops-quiet-empty">Les commandes apparaîtront après leurs premières utilisations.</p>}
                    </section>

                    <section className="ops-panel site-panel ops-activity-panel">
                        <div className="ops-panel-heading">
                            <div><p className="site-eyebrow">JOURNAL</p><h2>Erreurs récentes</h2></div>
                            <span className="ops-count">{Number(observability.errorTotal || 0)} au total</span>
                        </div>
                        {recentErrors.length ? (
                            <ol className="ops-activity-list">
                                {recentErrors.map((item, index) => (
                                    <li key={`${item.ts}-${index}`}>
                                        <span className="ops-activity-dot" />
                                        <span className="ops-activity-copy"><strong>{item.type || 'Erreur'}</strong><small>{String(item.message || '').slice(0, 90)}</small></span>
                                        <time>{item.ts ? new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="ops-quiet-empty">Aucune erreur récente signalée.</p>}
                    </section>
                </aside>
            </div>

            <section className="ops-bottom-links">
                <Link to="/modules"><span>Modules</span><strong>Configurer les fonctions du bot →</strong></Link>
                <Link to="/commands"><span>Documentation</span><strong>Parcourir les commandes →</strong></Link>
                <Link to="/help"><span>Support</span><strong>Obtenir de l’aide →</strong></Link>
            </section>
        </main>
    );
}

export default Dashboard;
import { useEffect, useMemo, useState } from 'react';
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

    useEffect(() => {
        let active = true;
        botService.getOverview()
            .then((data) => {
                if (active) {
                    setOverview(data);
                    setError('');
                }
            })
            .catch((apiError) => {
                if (active) setError(apiError.message || 'Impossible de charger les données du bot.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

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

    const cards = [
        { label: 'Serveurs', value: Number(stats.guildCount || 0).toLocaleString(), detail: 'connectés au bot', marker: '01' },
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
                    <button type="button" onClick={() => window.location.reload()} className="ops-action-button">Actualiser</button>
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
                <section className="ops-panel site-panel">
                    <div className="ops-panel-heading">
                        <div><p className="site-eyebrow">VOS SERVEURS</p><h2>Serveurs à gérer</h2></div>
                        <span className="ops-count">{discordGuilds.length} serveur(s) Discord</span>
                    </div>
                    {discordGuilds.length ? (
                        <>
                            <div className="ops-table-head"><span>Serveur</span><span>Bot</span><span>Membres</span><span>Actions rapides</span></div>
                            <div className="ops-server-list">
                                {discordGuilds.map((guild) => {
                                    const connected = connectedGuildIds.has(String(guild.id));
                                    const canManage = hasManageGuildPermission(guild);
                                    const statusLabel = connected
                                        ? guildListIsFresh ? 'Installé' : 'Vu récemment · à vérifier'
                                        : guildListIsFresh
                                            ? 'Non ajouté'
                                            : 'À vérifier';
                                    const icon = getDiscordGuildIcon(guild);
                                    const serverStats = (overview?.guilds || []).find((item) => String(item.id) === String(guild.id));
                                    return (
                                        <article className="ops-server-row" key={guild.id}>
                                            <div className="ops-server-identity">
                                                {icon ? <img src={icon} alt="" /> : <span className="ops-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                <span>{guild.name}</span>
                                            </div>
                                            <span className={`ops-server-status ${connected ? 'is-connected' : guildListIsFresh ? 'is-disconnected' : 'is-unknown'}`}><i />{statusLabel}</span>
                                            <span className="ops-server-members">{serverStats ? Number(serverStats.memberCount || 0).toLocaleString() : '—'}</span>
                                            <div className="ops-server-actions">
                                                {connected && !guildListIsFresh ? (
                                                    <span className="ops-action-hint">Actualisez l’état</span>
                                                ) : connected ? (
                                                    canManage ? (
                                                        <Link to={`/dashboard/servers/${guild.id}/config`} className="ops-action-button">Configurer <span aria-hidden="true">↗</span></Link>
                                                    ) : <span className="ops-action-hint">Gérer le serveur requis</span>
                                                ) : guildListIsFresh && canManage ? (
                                                    <button type="button" onClick={() => inviteBot(guild.id)} disabled={inviteLoading === guild.id} className="ops-action-button">{inviteLoading === guild.id ? 'Ouverture…' : 'Ajouter le bot'}</button>
                                                ) : !canManage ? (
                                                    <span className="ops-action-hint">Gérer le serveur requis</span>
                                                ) : (
                                                    <span className="ops-action-hint">Actualisez pour vérifier</span>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="ops-empty-state">
                                            <p>Aucun serveur Discord n’est chargé dans cette session.</p>
                                            <Link to="/login" className="site-link">Reconnecter Discord pour actualiser la liste →</Link>
                        </div>
                    )}
                    <div className="ops-server-footer">
                        <span>Disponibilité globale <strong>{bot.status === 'online' ? 'Opérationnelle' : 'À vérifier'}</strong></span>
                        <span>Depuis le redémarrage <strong>{formatUptime(bot.uptime)}</strong></span>
                    </div>
                </section>

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
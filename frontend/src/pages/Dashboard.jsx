import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { managesIslamGuild } from '../context/islamAccess.js';
import { botService, discordService } from '../services/api.js';
import Icon from '../components/Icon.jsx';

// Serveur officiel d'Azim
const HOME_GUILD_ID = '1283533269047971894';

function hasManageGuildPermission(guild) {
    if (guild?.owner) return true;
    try {
        return (BigInt(guild?.permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

function formatUptime(seconds, t) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const d = Math.floor(safeSeconds / 86400);
    const h = Math.floor((safeSeconds % 86400) / 3600);
    const m = Math.floor((safeSeconds % 3600) / 60);
    if (d) return t('panel.days', { d, h });
    if (h) return t('panel.hours', { h, m });
    return t('panel.minutes', { m });
}

function getDiscordGuildIcon(guild) {
    if (guild.iconUrl) return guild.iconUrl;
    if (guild.icon) return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`;
    return null;
}

function Dashboard() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';
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

            // Thème islam : uniquement si la personne gère un serveur où le mode islam est actif
            setIsIslamUnlocked(managesIslamGuild(data?.guilds));
        } catch (apiError) {
            setError(apiError.message || t('panel.load_error'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, setIsIslamUnlocked, t]);

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
            .slice(0, 5);
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
            .slice(0, 2);
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
    // Le serveur officiel Azim As-Sunnah est toujours affiché, en premier ; tous les serveurs du bot sont listés
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
                    publicInviteUrl: botGuild?.publicInviteUrl || null,
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
                        publicInviteUrl: bg.publicInviteUrl || null,
                        connected: true,
                        canManage: false,
                        fromBotList: true,
                    });
                    addedIds.add(id);
                }
            }
        }
        // Azim As-Sunnah est toujours présenté ici, même pour les personnes qui le gèrent
        if (!result.some((g) => g.id === HOME_GUILD_ID)) {
            const home = (overview?.guilds || []).find((bg) => String(bg.id) === HOME_GUILD_ID);
            if (home) {
                result.push({
                    id: HOME_GUILD_ID,
                    name: home.name,
                    iconUrl: home.iconUrl,
                    memberCount: home.memberCount,
                    publicInviteUrl: home.publicInviteUrl || null,
                    connected: true,
                    canManage: false,
                    fromBotList: true,
                });
            }
        }
        // Azim As-Sunnah d'abord, puis les serveurs ayant autorisé leur lien (/vitrine) ; l'ordre reste stable sinon
        const rank = (guild) => (guild.id === HOME_GUILD_ID ? 2 : guild.publicInviteUrl ? 1 : 0);
        return result.sort((a, b) => rank(b) - rank(a));
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
        { label: t('panel.stat_servers'), value: totalConnectedCount.toLocaleString(locale), detail: t('panel.stat_servers_detail'), icon: 'server' },
        { label: t('panel.stat_members'), value: Number(stats.memberCount || 0).toLocaleString(locale), detail: t('panel.stat_members_detail'), icon: 'users' },
        { label: t('panel.stat_commands'), value: Number(stats.commandCount24h || 0).toLocaleString(locale), detail: t('panel.stat_commands_detail'), icon: 'terminal' },
        { label: t('panel.stat_latency'), value: `${Math.max(0, Number(bot.latency || 0))} ms`, detail: t('panel.stat_latency_detail', { uptime: formatUptime(bot.uptime, t) }), icon: 'activity' },
    ];

    const inviteBot = async (guildId) => {
        setInviteLoading(guildId);
        try {
            const invite = await discordService.getBotInviteUrl(guildId);
            window.open(invite.url, '_blank', 'noopener,noreferrer');
        } catch {
            setError(t('panel.invite_error'));
        } finally {
            setInviteLoading(null);
        }
    };

    const serverTabs = [
        { id: 'manage', label: t('panel.tab_manage'), list: manageableGuilds },
        { id: 'invite', label: t('panel.tab_invite'), list: inviteableGuilds },
        { id: 'other', label: t('panel.tab_other'), list: otherBotGuilds },
    ];
    const currentTab = serverTabs.find((tab) => tab.id === serverTab) || serverTabs[0];
    const isOnline = bot.status === 'online';
    const displayName = user?.firstname || user?.username;

    const renderGuildCard = (guild) => {
        const icon = getDiscordGuildIcon(guild);
        const initial = (guild.name || '?').slice(0, 1).toUpperCase();
        return (
            <article className={`pnl-guild${guild.connected ? '' : ' is-pending'}`} key={guild.id}>
                {guild.publicInviteUrl && !guild.canManage ? (
                    <a className="pnl-guild__link" href={guild.publicInviteUrl} target="_blank" rel="noopener noreferrer" aria-label={t('panel.join', { name: guild.name })} />
                ) : null}
                <div className="pnl-guild__banner" style={icon ? { backgroundImage: `url(${icon})` } : undefined} />
                <div className="pnl-guild__body">
                    {icon ? <img className="pnl-guild__icon" src={icon} alt="" /> : <span className="pnl-guild__icon pnl-guild__icon--fallback">{initial}</span>}
                    <h3 title={guild.name}>{guild.name}</h3>
                    <p>
                        {guild.connected
                            ? (guild.memberCount ? t('panel.members', { count: Number(guild.memberCount).toLocaleString(locale) }) : t('panel.installed'))
                            : t('panel.not_installed')}
                    </p>
                    {guild.connected && guild.canManage ? (
                        <Link to={`/dashboard/servers/${guild.id}/config`} className="ui-btn ui-btn--primary">
                            {t('panel.configure')} <Icon name="arrowRight" size={16} />
                        </Link>
                    ) : null}
                    {!guild.connected ? (
                        <button type="button" onClick={() => inviteBot(guild.id)} disabled={inviteLoading === guild.id} className="ui-btn">
                            <Icon name="plus" size={16} /> {inviteLoading === guild.id ? t('panel.opening') : t('panel.add')}
                        </button>
                    ) : null}
                    {guild.connected && !guild.canManage ? (
                        <span className="pnl-guild__note">{guild.publicInviteUrl ? t('panel.join_hint') : t('panel.readonly')}</span>
                    ) : null}
                </div>
            </article>
        );
    };

    return (
        <div className="pnl">
            <header className="pnl-head">
                <div className="pnl-head__who">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="pnl-head__avatar" /> : (
                        <span className="pnl-head__avatar pnl-head__avatar--fallback">{(displayName || 'A').charAt(0).toUpperCase()}</span>
                    )}
                    <div>
                        <h1>{displayName ? t('panel.hello', { name: displayName }) : t('panel.your_servers')}</h1>
                        <p className={`pnl-head__status${isOnline ? ' is-online' : ''}`}>
                            <i />
                            {loading ? t('panel.connecting') : isOnline ? t('panel.online', { ms: Math.max(0, Number(bot.latency || 0)) }) : t('panel.unavailable')}
                        </p>
                    </div>
                </div>
                <div className="pnl-head__actions">
                    <button type="button" onClick={loadData} disabled={refreshing} className="ui-btn">
                        <Icon name="refresh" size={16} className={refreshing ? 'ui-spin' : ''} /> {refreshing ? 'Actualisation…' : 'Actualiser'}
                    </button>
                </div>
            </header>

            {error ? <div role="alert" className="pnl-alert"><Icon name="alert" size={18} /> {error}</div> : null}

            <section className="ui-stats" aria-label={t('panel.stats_label')}>
                {cards.map((card) => (
                    <article className="ui-stat" key={card.label}>
                        <span className="ui-stat__icon"><Icon name={card.icon} size={20} /></span>
                        <div>
                            <small>{card.label}</small>
                            <strong>{loading ? '—' : card.value}</strong>
                            <span>{loading ? t('panel.reading') : card.detail}</span>
                        </div>
                    </article>
                ))}
            </section>

            <div className="pnl-grid">
                <section className="pnl-card pnl-servers">
                    <div className="pnl-card__head">
                        <h2>{t('panel.servers')}</h2>
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
                                    <p>{t('panel.empty_manage')}</p>
                                    {inviteableGuilds.length ? (
                                        <button type="button" className="ui-btn ui-btn--primary" onClick={() => setServerTab('invite')}>{t('panel.see_invite')}</button>
                                    ) : (
                                        <p className="pnl-muted">{t('panel.empty_hint')}</p>
                                    )}
                                </>
                            ) : currentTab.id === 'invite' ? (
                                <p>{t('panel.empty_invite')}</p>
                            ) : (
                                <p>{t('panel.empty_other')}</p>
                            )}
                        </div>
                    )}

                    <p className="pnl-resync">
                        {t('panel.resync_q')} <Link to="/login">{t('panel.resync')}</Link>
                    </p>
                </section>

                <aside className="pnl-side">
                    <section className="pnl-card">
                        <div className="pnl-card__head">
                            <h2>{t('panel.top_commands')}</h2>
                            <Link to="/command-history" className="pnl-link">{t('panel.history')} <Icon name="arrowRight" size={14} /></Link>
                        </div>
                        {topCommands.length ? (
                            <ol className="pnl-bars">
                                {topCommands.map((command) => (
                                    <li key={command.name}>
                                        <code>/{command.name}</code>
                                        <span className="pnl-bars__track"><i style={{ width: `${Math.max(4, (Number(command.count || 0) / maxCommandCount) * 100)}%` }} /></span>
                                        <strong>{Number(command.count || 0).toLocaleString(locale)}</strong>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="pnl-muted">{t('panel.no_commands')}</p>}
                    </section>

                    <section className="pnl-card">
                        <div className="pnl-card__head">
                            <h2>{t('panel.recent_errors')}</h2>
                            <span className="pnl-count">{t('panel.errors_total', { count: Number(errorTotal || 0) })}</span>
                        </div>
                        {recentErrors.length ? (
                            <ul className="pnl-errors">
                                {recentErrors.map((item, index) => (
                                    <li key={`${item.ts}-${index}`}>
                                        <span className="pnl-errors__icon"><Icon name="alert" size={15} /></span>
                                        <div>
                                            <strong>{item.type || t('panel.error_default')}</strong>
                                            <small title={String(item.message || '')}>{String(item.message || '').slice(0, 90)}</small>
                                        </div>
                                        <time>{item.ts ? new Date(item.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="pnl-muted pnl-ok"><Icon name="check" size={16} /> {t('panel.no_errors')}</p>
                        )}
                    </section>
                </aside>
            </div>

        </div>
    );
}

export default Dashboard;
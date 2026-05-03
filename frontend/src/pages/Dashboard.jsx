import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { botService, discordService, systemService } from '../services/api.js';

function hasManageGuildPermission(permissions) {
    try {
        return (BigInt(permissions || '0') & 0x20n) === 0x20n;
    } catch {
        return false;
    }
}

function formatUptime(seconds = 0) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [oauthStatus, setOauthStatus] = useState(null);
    const [oauthTesting, setOauthTesting] = useState(false);
    const [expandedGuild, setExpandedGuild] = useState(null);
    const [guildHistory, setGuildHistory] = useState({});
    const [guildHistoryLoading, setGuildHistoryLoading] = useState({});

    useEffect(() => {
        let mounted = true;

        async function loadOverview() {
            try {
                const data = await botService.getOverview();
                if (mounted) {
                    setOverview(data);
                    setError('');
                }
            } catch (apiError) {
                if (mounted) {
                    setError(apiError.message || t('dashboard.load_error'));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadOverview();

        return () => {
            mounted = false;
        };
    }, [t]);

    const testOAuth = useCallback(async () => {
        setOauthTesting(true);
        try {
            const health = await systemService.getHealth();
            setOauthStatus(health?.services?.oauth || { status: 'error' });
        } catch {
            setOauthStatus({ status: 'error' });
        } finally {
            setOauthTesting(false);
        }
    }, []);

    const toggleGuildHistory = useCallback(async (guildId) => {
        if (expandedGuild === guildId) {
            setExpandedGuild(null);
            return;
        }
        setExpandedGuild(guildId);
        if (guildHistory[guildId]) return;
        setGuildHistoryLoading(prev => ({ ...prev, [guildId]: true }));
        try {
            const data = await botService.getGuildStats(guildId);
            setGuildHistory(prev => ({ ...prev, [guildId]: data.history || [] }));
        } catch {
            setGuildHistory(prev => ({ ...prev, [guildId]: [] }));
        } finally {
            setGuildHistoryLoading(prev => ({ ...prev, [guildId]: false }));
        }
    }, [expandedGuild, guildHistory]);

    const stats = overview?.stats || {};
    const bot = overview?.bot || {};
    const observability = overview?.observability || {};
    const topCommands = Array.isArray(observability.topCommands) ? observability.topCommands : [];
    const guilds = useMemo(() => overview?.guilds || [], [overview]);
    const dataSource = overview?.source || 'defaults';
    const generatedAt = overview?.generatedAt;
    const isStale = Boolean(overview?.isStale);
    const errorByType = observability.errorByType && typeof observability.errorByType === 'object'
        ? Object.entries(observability.errorByType)
            .map(([type, count]) => ({ type, count: Number(count || 0) }))
            .filter((row) => row.count > 0)
            .sort((a, b) => b.count - a.count)
        : [];

    const botIsOnline = bot.status === 'online';
    const discordGuilds = useMemo(() => {
        try {
            const raw = localStorage.getItem('discord_guilds');
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, []);

    const manageableGuilds = useMemo(
        () => discordGuilds.filter((guild) => hasManageGuildPermission(guild.permissions)),
        [discordGuilds]
    );

    const connectedGuildIds = useMemo(() => new Set(guilds.map((guild) => String(guild.id))), [guilds]);

    const cards = [
        {
            key: 'guildCount',
            label: t('dashboard.cards.guilds'),
            value: stats.guildCount || 0,
        },
        {
            key: 'memberCount',
            label: t('dashboard.cards.members'),
            value: stats.memberCount || 0,
        },
        {
            key: 'commandCount24h',
            label: t('dashboard.cards.commands_24h'),
            value: stats.commandCount24h || 0,
        },
        {
            key: 'activeUsers24h',
            label: t('dashboard.cards.active_users_24h'),
            value: stats.activeUsers24h || 0,
        },
        {
            key: 'errorTotal',
            label: t('dashboard.cards.errors_total'),
            value: stats.errorTotal || 0,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white p-6">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        {t('dashboard.title', { name: user?.firstname })}
                    </h1>
                    <p className="text-slate-600 mb-4">
                        {t('dashboard.email_label')} <span className="font-semibold">{user?.email}</span>
                    </p>

                    <div className="flex flex-wrap gap-3 items-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${botIsOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${botIsOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {botIsOnline ? t('dashboard.status.online') : t('dashboard.status.offline')}
                        </span>
                        <span className="text-sm text-slate-500">
                            {t('dashboard.bot_name')}: <span className="font-medium text-slate-700">{bot.name || 'Discord Bot'}</span>
                        </span>
                        <span className="text-sm text-slate-500">
                            {t('dashboard.uptime')}: <span className="font-medium text-slate-700">{formatUptime(bot.uptime)}</span>
                        </span>
                        <span className="text-sm text-slate-500">
                            {t('dashboard.latency')}: <span className="font-medium text-slate-700">{Math.max(0, Number(bot.latency || 0))}ms</span>
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${dataSource === 'api' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {dataSource === 'api' ? t('dashboard.source_api') : t('dashboard.source_cache')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${isStale ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                            {isStale ? t('dashboard.data_stale') : t('dashboard.data_fresh')}
                        </span>
                        {generatedAt ? (
                            <span className="text-xs text-slate-500 mono">
                                {t('dashboard.updated_at')}: {new Date(generatedAt).toLocaleString()}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={testOAuth}
                            disabled={oauthTesting}
                            className="btn btn-soft text-sm disabled:opacity-60"
                        >
                            {oauthTesting ? t('dashboard.oauth_testing') : t('dashboard.oauth_test_btn')}
                        </button>
                        <Link to="/command-history" className="btn btn-soft text-sm">
                            {t('command_history.title')}
                        </Link>
                        {oauthStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                oauthStatus.status === 'ok'
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}>
                                OAuth: {t(`status.badge.${oauthStatus.status}`, oauthStatus.status)}
                                {oauthStatus.status !== 'ok' && !oauthStatus.clientId ? ` — ${t('dashboard.oauth_missing_client_id')}` : ''}
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-md p-8 text-slate-600">{t('dashboard.loading')}</div>
                ) : null}

                {error ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4">
                        {t('dashboard.load_error')}: {error}
                    </div>
                ) : null}

                {!loading ? (
                    <>
                        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {cards.map((card) => (
                                <article key={card.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                                    <p className="text-sm text-slate-500 mb-2">{card.label}</p>
                                    <p className="text-3xl font-bold text-slate-800">{card.value.toLocaleString()}</p>
                                </article>
                            ))}
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.guilds_title')}</h2>
                            {guilds.length === 0 ? (
                                <p className="text-slate-500">{t('dashboard.guilds_empty')}</p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {guilds.map((guild) => (
                                        <div key={guild.id || guild.name} className="rounded-xl border border-slate-100 overflow-hidden">
                                            <button
                                                onClick={() => toggleGuildHistory(guild.id)}
                                                className="flex items-center gap-3 w-full p-3 text-left hover:bg-slate-50 transition-colors"
                                            >
                                                {guild.iconUrl ? (
                                                    <img src={guild.iconUrl} alt={guild.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                                                        {(guild.name || '?').slice(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-800 font-medium truncate">{guild.name}</p>
                                                    <p className="text-slate-500 text-sm">
                                                        {t('dashboard.guild_members', { count: guild.memberCount || 0 })}
                                                    </p>
                                                </div>
                                                <span className="text-slate-400 text-xs shrink-0">
                                                    {expandedGuild === guild.id ? '▲' : '▼'}
                                                </span>
                                            </button>
                                            {expandedGuild === guild.id && (
                                                <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-3">
                                                    {guildHistoryLoading[guild.id] && (
                                                        <p className="text-slate-400 text-sm">{t('dashboard.loading')}</p>
                                                    )}
                                                    {!guildHistoryLoading[guild.id] && (!guildHistory[guild.id] || guildHistory[guild.id].length === 0) && (
                                                        <p className="text-slate-400 text-sm">{t('dashboard.guild_history_empty')}</p>
                                                    )}
                                                    {!guildHistoryLoading[guild.id] && guildHistory[guild.id]?.length > 0 && (
                                                        <div className="space-y-1.5">
                                                            <p className="text-xs text-slate-500 font-medium mb-2">{t('dashboard.guild_history_title')}</p>
                                                            {guildHistory[guild.id].slice(0, 5).map((snap, i) => (
                                                                <div key={i} className="flex items-center justify-between text-xs text-slate-600 rounded px-2 py-1 bg-white border border-slate-100">
                                                                    <span>{new Date(snap.createdAt).toLocaleString()}</span>
                                                                    <span>{t('dashboard.guild_members', { count: snap.memberCount || 0 })}</span>
                                                                    <span className={`px-1.5 py-0.5 rounded-full ${snap.botStatus === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                        {snap.botStatus}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.top_commands_title')}</h2>
                            {topCommands.length === 0 ? (
                                <p className="text-slate-500">{t('dashboard.top_commands_empty')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {topCommands.map((row, index) => (
                                        <div key={row.name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                                            <span className="text-slate-700 font-medium">{index + 1}. /{row.name}</span>
                                            <span className="text-slate-500 text-sm">{row.count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.errors_breakdown_title')}</h2>
                            {errorByType.length === 0 ? (
                                <p className="text-slate-500">{t('dashboard.errors_breakdown_empty')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {errorByType.map((row) => (
                                        <div key={row.type} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                                            <span className="text-slate-700 font-medium">{row.type}</span>
                                            <span className="text-slate-500 text-sm">{row.count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.discord_servers_title')}</h2>
                            {manageableGuilds.length === 0 ? (
                                <p className="text-slate-500">{t('dashboard.discord_servers_empty')}</p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {manageableGuilds.map((guild) => {
                                        const isConnected = connectedGuildIds.has(String(guild.id));
                                        return (
                                            <div key={guild.id} className="rounded-xl border border-slate-100 p-3 bg-slate-50/40">
                                                <p className="text-slate-800 font-medium">{guild.name}</p>
                                                <p className="text-slate-500 text-sm">ID: {guild.id}</p>
                                                <span className={`inline-flex mt-2 text-xs px-2 py-1 rounded-full border ${isConnected ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                                                    {isConnected ? t('dashboard.discord_server_connected') : t('dashboard.discord_server_not_connected')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default Dashboard;
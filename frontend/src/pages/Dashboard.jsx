import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { botService } from '../services/api.js';

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
                                        <div key={guild.id || guild.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                                            {guild.iconUrl ? (
                                                <img src={guild.iconUrl} alt={guild.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold">
                                                    {(guild.name || '?').slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-slate-800 font-medium">{guild.name}</p>
                                                <p className="text-slate-500 text-sm">
                                                    {t('dashboard.guild_members', { count: guild.memberCount || 0 })}
                                                </p>
                                            </div>
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
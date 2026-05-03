import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { botService } from '../services/api.js';

function CommandHistory() {
    const { t } = useTranslation();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('count');

    useEffect(() => {
        let mounted = true;
        botService.getOverview()
            .then(data => { if (mounted) { setOverview(data); setError(''); } })
            .catch(err => { if (mounted) setError(err.message || t('dashboard.load_error')); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [t]);

    const allCommands = useMemo(() => {
        const commandByName = overview?.observability?.commandByName;
        if (!commandByName || typeof commandByName !== 'object') return [];
        return Object.entries(commandByName)
            .map(([name, count]) => ({ name, count: Number(count || 0) }))
            .filter(c => c.count > 0);
    }, [overview]);

    const filtered = useMemo(() => {
        let list = allCommands;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q));
        }
        if (sortBy === 'count') return [...list].sort((a, b) => b.count - a.count);
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }, [allCommands, search, sortBy]);

    const total = allCommands.reduce((s, c) => s + c.count, 0);
    const maxCount = filtered[0]?.count || 1;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-cyan-100 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{t('command_history.title')}</h1>
                        {!loading && !error && (
                            <p className="text-slate-500 text-sm mt-1">
                                {t('command_history.total', { count: total.toLocaleString() })}
                                {' · '}
                                {t('command_history.unique', { count: allCommands.length })}
                            </p>
                        )}
                    </div>
                    <Link to="/dashboard" className="btn btn-soft text-sm">{t('dashboard.back')}</Link>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white p-6">
                    <div className="flex flex-wrap gap-3 mb-5">
                        <input
                            type="text"
                            placeholder={t('command_history.search_placeholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="count">{t('command_history.sort_count')}</option>
                            <option value="name">{t('command_history.sort_name')}</option>
                        </select>
                    </div>

                    {loading && (
                        <p className="text-slate-500 text-sm">{t('dashboard.loading')}</p>
                    )}
                    {error && (
                        <p className="text-rose-600 text-sm">{error}</p>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                        <p className="text-slate-400 text-sm">{t('command_history.no_results')}</p>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div className="space-y-2">
                            {filtered.map((cmd, i) => (
                                <div
                                    key={cmd.name}
                                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3"
                                >
                                    <span className="text-slate-400 text-xs w-6 text-right font-mono shrink-0">
                                        #{sortBy === 'count' ? i + 1 : '—'}
                                    </span>
                                    <span className="font-mono text-sm font-semibold text-slate-800 flex-1 truncate">
                                        /{cmd.name}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="h-2 rounded-full bg-emerald-100 overflow-hidden hidden sm:block" style={{ width: '80px' }}>
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (cmd.count / maxCount) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-slate-700 text-sm font-semibold w-14 text-right">
                                            {cmd.count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommandHistory;

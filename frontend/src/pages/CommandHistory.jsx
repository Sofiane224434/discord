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
        <main className="site-page site-section-page history-page">
            <div className="history-wrapper">
                <div className="history-heading site-panel">
                    <div>
                        <p className="site-eyebrow">ANALYTIQUES</p>
                        <h1>{t('command_history.title')}</h1>
                        {!loading && !error && (
                            <p className="text-slate-500 text-sm mt-1">
                                {t('command_history.total', { count: total.toLocaleString() })}
                                {' · '}
                                {t('command_history.unique', { count: allCommands.length })}
                            </p>
                        )}
                    </div>
                    <Link to="/dashboard" className="btn btn-soft text-sm">← {t('dashboard.back')}</Link>
                </div>

                <div className="history-table site-panel">
                    <div className="history-toolbar">
                        <input
                            type="text"
                            placeholder={t('command_history.search_placeholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="form-input history-search"
                        />
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="form-input history-sort"
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
                                <div key={cmd.name} className="history-command-row">
                                    <span className="history-rank">
                                        #{sortBy === 'count' ? i + 1 : '—'}
                                    </span>
                                    <span className="history-command-name">
                                        /{cmd.name}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="history-bar-track" aria-hidden="true">
                                            <div
                                                className="history-bar-fill"
                                                style={{ width: `${Math.min(100, (cmd.count / maxCount) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="history-command-count">
                                            {cmd.count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default CommandHistory;

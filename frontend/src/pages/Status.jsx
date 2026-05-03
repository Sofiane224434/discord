import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { systemService } from '../services/api.js';

const STATUS_COLORS = {
    ok: 'bg-emerald-500',
    degraded: 'bg-amber-400',
    error: 'bg-rose-500',
    unconfigured: 'bg-slate-400',
};

function StatusBadge({ status }) {
    const { t } = useTranslation();
    const color = STATUS_COLORS[status] || STATUS_COLORS.error;
    const label = t(`status.badge.${status}`, status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${color}`}>
            {label}
        </span>
    );
}

function ServiceCard({ label, description, status }) {
    return (
        <article className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{label}</p>
                <StatusBadge status={status} />
            </div>
            <p className="text-slate-500 text-sm">{description}</p>
        </article>
    );
}

function Status() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        function load() {
            setLoading(true);
            systemService.getHealth()
                .then(data => { if (mounted) setHealth(data); })
                .catch(() => { if (mounted) setHealth(null); })
                .finally(() => { if (mounted) setLoading(false); });
        }
        load();
        const interval = setInterval(load, 30000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    const services = health?.services || {};
    const db = services.db || {};
    const botApi = services.botApi || {};
    const oauth = services.oauth || {};

    return (
        <div className="min-h-screen px-4 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white/85 border border-white rounded-3xl shadow-xl backdrop-blur p-8 md:p-12">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900">{t('categories.status.title')}</h1>
                    {!loading && health && (
                        <StatusBadge status={health.status} />
                    )}
                </div>
                <p className="text-base md:text-lg text-slate-600 mb-8">{t('categories.status.description')}</p>

                {loading && (
                    <p className="text-slate-500 mb-6 text-sm">{t('status.loading')}</p>
                )}

                {!loading && (
                    <>
                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6 text-sm">
                            <ServiceCard
                                label={t('categories.status.cards.database.label')}
                                description={t('categories.status.cards.database.text')}
                                status={db.status || 'error'}
                            />
                            <ServiceCard
                                label={t('categories.status.cards.api.label')}
                                description={t('categories.status.cards.api.text')}
                                status={botApi.status || 'unconfigured'}
                            />
                            <ServiceCard
                                label={t('categories.status.cards.bot.label')}
                                description={t('categories.status.cards.bot.text')}
                                status={botApi.status || 'unconfigured'}
                            />
                            <ServiceCard
                                label={t('status.oauth_label')}
                                description={t('status.oauth_desc')}
                                status={oauth.status || 'unconfigured'}
                            />
                        </div>
                        {health && (
                            <p className="text-xs text-slate-400 mb-6">
                                {t('status.checked_at')} {new Date(health.timestamp).toLocaleTimeString()}
                            </p>
                        )}
                        {!health && (
                            <p className="text-sm text-rose-600 mb-6">{t('status.fetch_error')}</p>
                        )}
                    </>
                )}

                <div className="flex flex-wrap gap-3">
                    <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">
                        {t('categories.status.cta_dashboard')}
                    </Link>
                    <Link to="/" className="btn btn-soft">
                        {t('categories.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Status;

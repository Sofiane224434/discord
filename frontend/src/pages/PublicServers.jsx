import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';

function PublicServers() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen px-4 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white/85 border border-white rounded-3xl shadow-xl backdrop-blur p-8 md:p-12">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{t('categories.public_servers.title')}</h1>
                <p className="text-base md:text-lg text-slate-600 mb-8">{t('categories.public_servers.description')}</p>

                <div className="grid md:grid-cols-3 gap-3 mb-8 text-sm">
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.public_servers.cards.total.label')}</p>
                        <p className="text-slate-500">{t('categories.public_servers.cards.total.text')}</p>
                    </article>
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.public_servers.cards.active.label')}</p>
                        <p className="text-slate-500">{t('categories.public_servers.cards.active.text')}</p>
                    </article>
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.public_servers.cards.health.label')}</p>
                        <p className="text-slate-500">{t('categories.public_servers.cards.health.text')}</p>
                    </article>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">
                        {t('categories.public_servers.cta_dashboard')}
                    </Link>
                    <Link to="/" className="btn btn-soft">
                        {t('categories.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PublicServers;

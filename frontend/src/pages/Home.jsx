// pages/Home.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';

function Home() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();
    return (
        <div className="min-h-screen px-4 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-5xl w-full bg-white/80 border border-white rounded-3xl shadow-xl backdrop-blur p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100 mb-5 mono">
                    LIVE BOT OPERATIONS
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">{t('home.title')}</h1>
                <p className="text-base md:text-xl text-slate-600 mb-10 max-w-2xl">{t('home.subtitle')}</p>
                <div className="flex flex-wrap gap-3">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary">
                            {t('home.cta_dashboard')}
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn-primary">
                                {t('home.cta_start')}
                            </Link>
                            <Link to="/login" className="btn btn-soft">
                                {t('home.cta_login')}
                            </Link>
                        </>
                    )}
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 p-3 bg-white">
                        <p className="font-semibold text-slate-800">Monitoring serveur</p>
                        <p className="text-slate-500">Etat du bot, latence et uptime en un coup d'oeil.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 bg-white">
                        <p className="font-semibold text-slate-800">Metriques 24h</p>
                        <p className="text-slate-500">Commandes executees et activite utilisateur recentes.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 bg-white">
                        <p className="font-semibold text-slate-800">Sources resilientes</p>
                        <p className="text-slate-500">API bot en direct avec fallback sur snapshots SQL.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
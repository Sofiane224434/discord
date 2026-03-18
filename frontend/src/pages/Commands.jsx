import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';

function Commands() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    const commands = [
        { name: '/help', description: t('categories.commands.list.help') },
        { name: '/setup', description: t('categories.commands.list.setup') },
        { name: '/logs', description: t('categories.commands.list.logs') },
        { name: '/moderation', description: t('categories.commands.list.moderation') },
    ];

    return (
        <div className="min-h-screen px-4 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white/85 border border-white rounded-3xl shadow-xl backdrop-blur p-8 md:p-12">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{t('categories.commands.title')}</h1>
                <p className="text-base md:text-lg text-slate-600 mb-8">{t('categories.commands.description')}</p>

                <div className="grid md:grid-cols-2 gap-3 mb-8">
                    {commands.map((command) => (
                        <article key={command.name} className="rounded-xl border border-slate-200 p-4 bg-white">
                            <p className="mono text-sm font-semibold text-teal-700 mb-1">{command.name}</p>
                            <p className="text-slate-600 text-sm">{command.description}</p>
                        </article>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">
                        {t('categories.commands.cta_dashboard')}
                    </Link>
                    <Link to="/" className="btn btn-soft">
                        {t('categories.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Commands;

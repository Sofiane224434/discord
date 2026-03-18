import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Help() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen px-4 py-16 md:py-24 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white/85 border border-white rounded-3xl shadow-xl backdrop-blur p-8 md:p-12">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{t('categories.help.title')}</h1>
                <p className="text-base md:text-lg text-slate-600 mb-8">{t('categories.help.description')}</p>

                <div className="grid md:grid-cols-3 gap-3 mb-8 text-sm">
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.help.cards.docs.label')}</p>
                        <p className="text-slate-500">{t('categories.help.cards.docs.text')}</p>
                    </article>
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.help.cards.discord.label')}</p>
                        <p className="text-slate-500">{t('categories.help.cards.discord.text')}</p>
                    </article>
                    <article className="rounded-xl border border-slate-200 p-4 bg-white">
                        <p className="font-semibold text-slate-800 mb-1">{t('categories.help.cards.support.label')}</p>
                        <p className="text-slate-500">{t('categories.help.cards.support.text')}</p>
                    </article>
                </div>

                <div className="flex flex-wrap gap-3">
                    <a
                        href="https://discord.gg/xy3NpkjYsF"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                    >
                        {t('categories.help.cta_discord')}
                    </a>
                    <Link to="/" className="btn btn-soft">
                        {t('categories.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Help;

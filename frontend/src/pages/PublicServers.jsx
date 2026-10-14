import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { systemService } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { ADD_BOT_URL } from '../config/links.js';

function PublicServers() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        systemService.getHealth()
            .then((data) => { if (active) setHealth(data); })
            .catch(() => { if (active) setHealth(null); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const services = health?.services || {};

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <h1>{t('bots.title')}</h1>
                <p>{t('bots.lead')}</p>
            </header>

            <section className="public-server-metrics" aria-label={t('bots.services')}>
                <article><span>{t('bots.bot')}</span><strong className={services.botApi?.status === 'ok' ? 'public-server-online' : ''}>{loading ? t('bots.checking') : services.botApi?.status === 'ok' ? t('bots.online') : t('bots.unavailable')}</strong></article>
                <article><span>{t('bots.panel')}</span><strong className={services.db?.status === 'ok' ? 'public-server-online' : ''}>{loading ? t('bots.checking') : services.db?.status === 'ok' ? t('bots.online') : t('bots.unavailable')}</strong></article>
                <article><span>{t('bots.oauth')}</span><strong className={services.oauth?.status === 'ok' ? 'public-server-online' : ''}>{loading ? t('bots.checking') : services.oauth?.status === 'ok' ? t('bots.ready') : t('bots.unavailable')}</strong></article>
            </section>

            {loading ? <LoadingScreen label={t('bots.loading')} subtext={t('bots.loading_sub')} /> : null}
            {!loading && !health ? <p className="site-empty-state">{t('bots.down')}</p> : null}
            <section className="public-server-list" aria-label={t('bots.list_label')}>
                <article className="public-server-row">
                    <img src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'} alt="AzimBot" />
                    <div><h2>AzimBot</h2><p>{t('bots.bot_desc')}</p></div>
                    <span className={`public-server-tag ${services.botApi?.status === 'ok' ? 'is-online' : 'is-offline'}`}><i />{loading ? t('bots.checking') : services.botApi?.status === 'ok' ? t('bots.online') : t('bots.unavailable')}</span>
                </article>
            </section>

            <section className="module-cta site-panel">
                <div><h2>{t('bots.cta_title')}</h2><p>{t('bots.cta_lead')}</p></div>
                <a href={ADD_BOT_URL} target="_blank" rel="noreferrer" className="btn btn-primary">{t('bots.cta')} <span aria-hidden="true">↗</span></a>
            </section>
        </main>
    );
}

export default PublicServers;
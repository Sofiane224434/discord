import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/Icon.jsx';
import AccountSettings from '../components/AccountSettings.jsx';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

const THEMES = [
    {
        id: 'cyber',
        nameKey: 'settings.theme_cyber',
        descKey: 'settings.theme_cyber_desc',
        icon: '/icon.png',
        swatches: ['#0a1728', '#102239', '#20b9f2', '#b5a0ff'],
    },
    {
        id: 'islam',
        nameKey: 'settings.theme_islam',
        descKey: 'settings.theme_islam_desc',
        icon: '/icon-islam.png',
        swatches: ['#03140e', '#07261a', '#10b981', '#fbbf24'],
        locked: true,
    },
];


function Settings() {
    const { theme, setTheme, isIslamUnlocked } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation();

    const themes = THEMES.filter((th) => !th.locked || isIslamUnlocked);

    return (
        <main className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>{t('settings.title')}</h1>
                <p>{t('settings.lead')}</p>
            </header>

            <div className="set-stack">
                {isAuthenticated && user ? (
                    <AccountSettings />
                ) : (
                    <section className="ui-card set-section">
                        <div className="set-account set-account--guest">
                            <div className="set-account__who">
                                <strong>{t('settings.guest_title')}</strong>
                                <small>{t('settings.guest_lead')}</small>
                            </div>
                            <Link to="/login" className="ui-btn ui-btn--primary">{t('settings.guest_cta')}</Link>
                        </div>
                    </section>
                )}

                {/* Apparence */}
                <section className="ui-card set-section">
                    <div className="set-section__head">
                        <span className="set-section__icon" style={{ '--c': 'var(--azim-lilac)' }}><Icon name="sparkles" size={20} /></span>
                        <div>
                            <h2>{t('settings.appearance')}</h2>
                            <p>{t('settings.appearance_lead')}</p>
                        </div>
                    </div>

                    <div className="set-themes" role="radiogroup" aria-label={t('settings.theme')}>
                        {themes.map((th) => (
                            <button
                                key={th.id}
                                type="button"
                                role="radio"
                                aria-checked={theme === th.id}
                                className={`set-theme${theme === th.id ? ' is-active' : ''}`}
                                onClick={() => setTheme(th.id)}
                            >
                                <span className="set-theme__preview" style={{ background: th.swatches[0] }}>
                                    <span className="set-theme__bar" style={{ background: th.swatches[1] }}>
                                        <i style={{ background: th.swatches[2] }} />
                                    </span>
                                    <span className="set-theme__card" style={{ background: th.swatches[1] }}>
                                        <i style={{ background: th.swatches[2] }} />
                                        <i style={{ background: th.swatches[3] }} />
                                    </span>
                                    <img src={th.icon} alt="" />
                                </span>
                                <span className="set-theme__label">
                                    <strong>{t(th.nameKey)}</strong>
                                    <small>{t(th.descKey)}</small>
                                </span>
                                <span className="set-theme__check"><Icon name="check" size={14} strokeWidth={3} /></span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Langue */}
                <section className="ui-card set-section set-section--inline">
                    <div className="set-section__head">
                        <span className="set-section__icon" style={{ '--c': 'var(--azim-warm)' }}><Icon name="book" size={20} /></span>
                        <div>
                            <h2>{t('common.language')}</h2>
                            <p>{t('settings.language_lead')}</p>
                        </div>
                    </div>
                    <LanguageSwitch variant="long" />
                </section>
            </div>
        </main>
    );
}

export default Settings;

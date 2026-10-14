import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/Icon.jsx';

const THEMES = [
    {
        id: 'cyber',
        name: 'Cyber',
        desc: 'Bleu nuit et accents cyan',
        icon: '/icon.png',
        swatches: ['#0a1728', '#102239', '#20b9f2', '#b5a0ff'],
    },
    {
        id: 'islam',
        name: 'Islam & spiritualité',
        desc: 'Vert émeraude et reflets dorés',
        icon: '/icon-islam.png',
        swatches: ['#03140e', '#07261a', '#10b981', '#fbbf24'],
        locked: true,
    },
];

const LANGUAGES = [
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'English' },
];

function Settings() {
    const { theme, setTheme, isIslamUnlocked } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const { i18n } = useTranslation();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const avatarUrl = user?.avatarUrl || (user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null);
    const displayName = user?.global_name || user?.firstname || user?.username;
    const themes = THEMES.filter((t) => !t.locked || isIslamUnlocked);

    return (
        <main className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>Paramètres</h1>
                <p>Votre compte et l’apparence du site. Ces réglages sont enregistrés sur cet appareil.</p>
            </header>

            <div className="set-stack">
                {/* Compte */}
                <section className="ui-card set-section">
                    <div className="set-section__head">
                        <span className="set-section__icon" style={{ '--c': 'var(--azim-accent)' }}><Icon name="users" size={20} /></span>
                        <div>
                            <h2>Compte</h2>
                            <p>Votre connexion Discord.</p>
                        </div>
                    </div>

                    {isAuthenticated && user ? (
                        <div className="set-account">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="set-account__avatar" />
                            ) : (
                                <span className="set-account__avatar set-account__avatar--fallback">{(displayName || 'U').charAt(0).toUpperCase()}</span>
                            )}
                            <div className="set-account__who">
                                <strong>{displayName}</strong>
                                <small>@{user.username}</small>
                            </div>
                            <div className="set-account__actions">
                                <button type="button" onClick={logout} className="ui-btn ui-btn--danger">
                                    <Icon name="logout" size={16} /> Déconnexion
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="set-account set-account--guest">
                            <div className="set-account__who">
                                <strong>Vous n’êtes pas connecté</strong>
                                <small>Connectez-vous avec Discord pour gérer vos serveurs.</small>
                            </div>
                            <Link to="/login" className="ui-btn ui-btn--primary">Se connecter avec Discord</Link>
                        </div>
                    )}
                </section>

                {/* Apparence */}
                <section className="ui-card set-section">
                    <div className="set-section__head">
                        <span className="set-section__icon" style={{ '--c': 'var(--azim-lilac)' }}><Icon name="sparkles" size={20} /></span>
                        <div>
                            <h2>Apparence</h2>
                            <p>Le thème s’applique à tout le site.</p>
                        </div>
                    </div>

                    <div className="set-themes" role="radiogroup" aria-label="Thème">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="radio"
                                aria-checked={theme === t.id}
                                className={`set-theme${theme === t.id ? ' is-active' : ''}`}
                                onClick={() => setTheme(t.id)}
                            >
                                <span className="set-theme__preview" style={{ background: t.swatches[0] }}>
                                    <span className="set-theme__bar" style={{ background: t.swatches[1] }}>
                                        <i style={{ background: t.swatches[2] }} />
                                    </span>
                                    <span className="set-theme__card" style={{ background: t.swatches[1] }}>
                                        <i style={{ background: t.swatches[2] }} />
                                        <i style={{ background: t.swatches[3] }} />
                                    </span>
                                    <img src={t.icon} alt="" />
                                </span>
                                <span className="set-theme__label">
                                    <strong>{t.name}</strong>
                                    <small>{t.desc}</small>
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
                            <h2>Langue</h2>
                            <p>Langue de l’interface.</p>
                        </div>
                    </div>
                    <div className="ui-seg" role="radiogroup" aria-label="Langue">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.id}
                                type="button"
                                role="radio"
                                aria-checked={currentLanguage === lang.id}
                                className={currentLanguage === lang.id ? 'is-active' : ''}
                                onClick={() => i18n.changeLanguage(lang.id)}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Settings;

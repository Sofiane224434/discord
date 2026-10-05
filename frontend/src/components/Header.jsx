// components/Header.jsx
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';

const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
];

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const [menuOpen, setMenuOpen] = useState(false);
    const categoryLinks = [
        { label: 'Dashboard', to: isAuthenticated ? '/dashboard' : '/login' },
        { label: 'Bots', to: '/public-servers' },
        { label: 'Modules', to: '/modules' },
        { label: 'Documentation', to: '/commands' },
        { label: 'Analytics', to: isAuthenticated ? '/command-history' : '/login' },
        { label: 'Statut', to: '/status' },
        { label: 'Support', to: '/help' },
    ];

    const addToServerUrl = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };
    return (
        <header className="site-header sticky top-0 z-40 text-white">
            <div className="site-header-inner">
                <Link to="/" className="site-brand" aria-label="Azim, accueil">
                    <img src="/icon.png" alt="" className="site-brand-icon" />
                    <span>AZIM<span className="site-brand-dot">.</span></span>
                </Link>

                <button
                    type="button"
                    className="site-menu-toggle"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                </button>

                <nav className={`site-nav ${menuOpen ? 'site-nav-open' : ''}`} aria-label="Navigation principale">
                    {categoryLinks.map((item) => (
                        <NavLink
                            key={`${item.label}-${item.to}`}
                            to={item.to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) => `site-nav-link ${isActive ? 'site-nav-link-active' : ''}`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="site-header-actions">
                    <label className="site-language-control">
                        <span className="sr-only">Changer de langue</span>
                            <select
                                value={currentLanguage}
                                onChange={handleLanguageChange}
                                className="site-language-select"
                            >
                                {languages.map((language) => (
                                    <option key={language.code} value={language.code}>
                                        {language.label}
                                    </option>
                                ))}
                            </select>
                    </label>
                    {isAuthenticated ? (
                        <button type="button" onClick={handleLogout} className="site-account-button" title={user?.email || t('nav.logout')}>
                            <span className="site-account-indicator" />
                            <span className="site-account-label">{user?.firstname || 'Compte'}</span>
                            <span className="site-account-logout">{t('nav.logout')}</span>
                        </button>
                    ) : (
                        <Link to="/login" className="site-login-link">Connexion</Link>
                    )}
                    <a href={addToServerUrl} target="_blank" rel="noreferrer" className="site-add-button">
                        Ajouter le bot <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </div>
        </header>
    );
}
export default Header;
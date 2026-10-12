import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const [mobileOpen, setMobileOpen] = useState(false);

    // Menu latéral épuré : Accueil, Documentation, Retours, Paramètres, et Panel si connecté.
    // Plus besoin de "Modules", "Commandes" ou "Aide", tout est centralisé dans la Documentation.
    const navItems = [
        { label: 'Accueil', to: '/', icon: '🏠' },
        { label: 'Documentation', to: '/docs/accueil', icon: '📖' },
        { label: 'Retours & Idées', to: '/feedback', icon: '💬' },
        { label: 'Paramètres', to: '/settings', icon: '⚙️' },
        ...(isAuthenticated ? [{ label: 'Panel de gestion', to: '/dashboard', icon: '📊' }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <>
            {/* BARRE MOBILE EN HAUT (visible uniquement sur mobile / tablette < 1024px) */}
            <header className="lateral-mobile-bar" aria-label="En-tête mobile">
                <Link to="/" className="lateral-mobile-brand">
                    <img
                        src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                        alt="AzimBot"
                        className="lateral-brand-icon-sm"
                    />
                    <span className="lateral-brand-name">AzimBot</span>
                </Link>

                <button
                    type="button"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="lateral-mobile-toggle"
                    aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    aria-expanded={mobileOpen}
                >
                    <span className="lateral-toggle-line" />
                    <span className="lateral-toggle-line" />
                    <span className="lateral-toggle-line" />
                </button>
            </header>

            {/* FOND OBSCURCISSANT MOBILE QUAND LE MENU EST OUVERT */}
            {mobileOpen && (
                <div
                    className="lateral-backdrop"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* HEADER LATÉRAL PRINCIPAL (Sidebar fixe à gauche sur desktop) */}
            <aside
                className={`lateral-sidebar ${mobileOpen ? 'is-open' : ''}`}
                aria-label="Navigation principale latérale"
            >
                {/* 1. HAUT : LOGO + VERSION */}
                <div className="lateral-sidebar__top">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="lateral-sidebar__brand">
                        <img
                            src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                            alt="AzimBot"
                            className="lateral-brand-icon"
                        />
                        <div className="lateral-brand-meta">
                            <span className="lateral-brand-title">AzimBot</span>
                            <span className="lateral-brand-badge">v2.4</span>
                        </div>
                    </Link>
                </div>

                {/* 2. CENTRE : LIENS DE NAVIGATION */}
                <nav className="lateral-sidebar__nav" aria-label="Liens principaux">
                    <span className="lateral-nav-eyebrow">MENU PRINCIPAL</span>
                    <ul className="lateral-nav-list">
                        {navItems.map((item) => (
                            <li key={item.to} className="lateral-nav-item">
                                <NavLink
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `lateral-nav-link ${isActive ? 'is-active' : ''}`
                                    }
                                >
                                    <span className="lateral-nav-icon" aria-hidden="true">{item.icon}</span>
                                    <span className="lateral-nav-label">{item.label}</span>
                                    <span className="lateral-nav-glow" aria-hidden="true" />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* 3. BAS : COMPTE, LANGUE & BOUTON AJOUTER LE BOT */}
                <div className="lateral-sidebar__bottom">
                    {/* Sélecteur de langue FR / EN */}
                    <div className="lateral-lang-row">
                        <span className="lateral-lang-label">Langue :</span>
                        <div className="lateral-lang-pills">
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('fr')}
                                className={`lateral-lang-btn ${currentLanguage === 'fr' ? 'is-active' : ''}`}
                            >
                                FR
                            </button>
                            <span className="lateral-lang-sep">/</span>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('en')}
                                className={`lateral-lang-btn ${currentLanguage === 'en' ? 'is-active' : ''}`}
                            >
                                EN
                            </button>
                        </div>
                    </div>

                    {/* État de connexion utilisateur */}
                    {isAuthenticated ? (
                        <div className="lateral-user-card">
                            <div className="lateral-user-info">
                                <span className="lateral-user-avatar">
                                    {(user?.firstname || user?.username || 'U').charAt(0).toUpperCase()}
                                </span>
                                <div className="lateral-user-details">
                                    <span className="lateral-user-name">{user?.firstname || user?.username || 'Mon Compte'}</span>
                                    <span className="lateral-user-status">Connecté</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="lateral-logout-btn"
                                title="Se déconnecter"
                            >
                                🚪
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMobileOpen(false)}
                            className="lateral-login-link"
                        >
                            <span>Connexion Discord</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    )}

                    {/* Bouton Ajouter le bot */}
                    <a
                        href={ADD_BOT_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="lateral-add-bot-btn"
                    >
                        <span>🤖 Ajouter le bot</span>
                        <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </aside>
        </>
    );
}

export default Header;
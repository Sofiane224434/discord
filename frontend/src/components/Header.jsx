import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    // Fermer le menu dropdown utilisateur quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleLogout = () => {
        setUserMenuOpen(false);
        setMobileOpen(false);
        logout();
        navigate('/login');
    };

    // Navigation façon DraftBot (majuscules, clean)
    const navItems = [
        { label: 'DOCUMENTATION', to: '/docs/accueil' },
        ...(isAuthenticated ? [{ label: 'PANEL', to: '/dashboard' }] : [{ label: 'FONCTIONNALITÉS', to: '/#features' }]),
        { label: 'STATUTS', to: '/status' },
        { label: 'RETOURS & IDÉES', to: '/feedback' },
    ];

    return (
        <header className="draft-header" role="banner">
            <div className="draft-header__inner">
                {/* 1. GAUCHE : ICONE EMBLÈME + TEXT LOGO FAÇON DRAFTBOT */}
                <div className="draft-header__left">
                    <Link to="/" className="draft-header__brand" aria-label="Accueil AzimBot">
                        <img
                            src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                            alt="AzimBot Icon"
                            className="draft-header__icon"
                        />
                        <img
                            src={theme === 'islam' ? '/logo-islam.png' : '/logo.png'}
                            alt="AzimBot"
                            className="draft-header__text-logo"
                        />
                    </Link>
                </div>

                {/* 2. MILIEU : LIENS HORIZONTAUX EN MAJUSCULES */}
                <nav className="draft-header__nav" aria-label="Navigation principale">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `draft-nav-link ${isActive ? 'is-active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* 3. DROITE : BOUTON SUPPORT CAPSULE + UTILISATEUR OU CONNEXION */}
                <div className="draft-header__right">
                    {/* Bouton Support outline façon DraftBot */}
                    <a
                        href="https://discord.gg/azim"
                        target="_blank"
                        rel="noreferrer"
                        className="draft-header__support-btn"
                    >
                        SUPPORT
                    </a>

                    {/* Menu Utilisateur connecté ou Bouton de connexion */}
                    {isAuthenticated && user ? (
                        <div className="draft-header__user-wrapper" ref={menuRef}>
                            <button
                                type="button"
                                className="draft-header__user-pill"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.username}
                                        className="draft-header__avatar-img"
                                    />
                                ) : (
                                    <div className="draft-header__avatar-fallback">
                                        {(user.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="draft-header__user-name">{user.username}</span>
                                <span className="draft-header__chevron" aria-hidden="true">
                                    {userMenuOpen ? '▲' : '▼'}
                                </span>
                            </button>

                            {/* Menu déroulant profil */}
                            {userMenuOpen && (
                                <div className="draft-user-dropdown" role="menu">
                                    <div className="draft-user-dropdown__header">
                                        <p className="draft-user-dropdown__user">{user.username}</p>
                                        <span className="draft-user-dropdown__badge">Connecté via Discord</span>
                                    </div>
                                    <div className="draft-user-dropdown__divider" />
                                    <Link
                                        to="/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="draft-user-dropdown__item"
                                        role="menuitem"
                                    >
                                        <span>⚙️</span>
                                        <span>Paramètres</span>
                                    </Link>
                                    <div className="draft-user-dropdown__divider" />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="draft-user-dropdown__item draft-user-dropdown__item--danger"
                                        role="menuitem"
                                    >
                                        <span>🚪</span>
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="draft-header__login-btn">
                            Connexion
                        </Link>
                    )}

                    {/* Burger mobile toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="draft-header__mobile-toggle"
                        aria-label={mobileOpen ? 'Fermer le menu mobile' : 'Ouvrir le menu mobile'}
                        aria-expanded={mobileOpen}
                    >
                        <span className="draft-toggle-line" />
                        <span className="draft-toggle-line" />
                        <span className="draft-toggle-line" />
                    </button>
                </div>
            </div>

            {/* TIROIR MOBILE */}
            {mobileOpen && (
                <div className="draft-mobile-drawer">
                    <nav className="draft-mobile-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className="draft-mobile-link"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <a
                            href="https://discord.gg/azim"
                            target="_blank"
                            rel="noreferrer"
                            className="draft-mobile-link draft-mobile-link--accent"
                            onClick={() => setMobileOpen(false)}
                        >
                            SUPPORT DISCORD ↗
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;
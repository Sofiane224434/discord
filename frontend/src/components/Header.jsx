import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from './Icon.jsx';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';
const SUPPORT_URL = 'https://discord.gg/azim';

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);

    // Fermer le menu utilisateur au clic extérieur
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen]);

    // Ombre sous le header dès qu'on a défilé
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        setUserMenuOpen(false);
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Documentation', to: '/docs/accueil', match: '/docs' },
        ...(isAuthenticated ? [{ label: 'Panel', to: '/dashboard', match: '/dashboard' }] : []),
        { label: 'Statuts', to: '/status', match: '/status' },
        { label: 'Retours & idées', to: '/feedback', match: '/feedback' },
    ];

    const isActive = (item) => location.pathname.startsWith(item.match);

    return (
        <header className={`az-header${scrolled ? ' is-scrolled' : ''}`} role="banner">
            <div className="az-header__inner">
                <Link to="/" className="az-header__brand" aria-label="Accueil AzimBot">
                    <img
                        src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                        alt=""
                        className="az-header__icon"
                    />
                    <img
                        src={theme === 'islam' ? '/logo-islam.png' : '/logo.png'}
                        alt="AzimBot"
                        className="az-header__wordmark"
                    />
                </Link>

                <nav className="az-header__nav" aria-label="Navigation principale">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={`az-nav-link${isActive(item) ? ' is-active' : ''}`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="az-header__actions">
                    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="az-header__ghost">
                        <Icon name="lifebuoy" size={17} />
                        <span>Support</span>
                    </a>

                    {isAuthenticated && user ? (
                        <div className="az-user" ref={menuRef}>
                            <button
                                type="button"
                                className="az-user__trigger"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="az-user__avatar" />
                                ) : (
                                    <span className="az-user__avatar az-user__avatar--fallback">
                                        {(user.username || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="az-user__name">{user.username}</span>
                                <Icon name="chevronDown" size={16} className={`az-user__chevron${userMenuOpen ? ' is-open' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="az-user__menu" role="menu">
                                    <div className="az-user__menu-head">
                                        <strong>{user.username}</strong>
                                        <small>Connecté avec Discord</small>
                                    </div>
                                    <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="az-user__item" role="menuitem">
                                        <Icon name="settings" size={16} /> Paramètres
                                    </Link>
                                    <button type="button" onClick={handleLogout} className="az-user__item az-user__item--danger" role="menuitem">
                                        <Icon name="logout" size={16} /> Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="az-header__ghost az-header__login">Connexion</Link>
                            <a href={ADD_BOT_URL} target="_blank" rel="noreferrer" className="az-header__cta">
                                <Icon name="plus" size={17} /> Ajouter Azim
                            </a>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="az-header__burger"
                        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={mobileOpen}
                    >
                        <Icon name={mobileOpen ? 'close' : 'menu'} size={22} />
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav className="az-drawer" aria-label="Navigation mobile" onClick={(e) => { if (e.target.closest('a')) setMobileOpen(false); }}>
                    {navItems.map((item) => (
                        <Link key={item.to} to={item.to} className={`az-drawer__link${isActive(item) ? ' is-active' : ''}`}>
                            {item.label}
                        </Link>
                    ))}
                    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="az-drawer__link">
                        Support Discord <Icon name="external" size={15} />
                    </a>
                    {!isAuthenticated && (
                        <Link to="/login" className="az-drawer__link">Connexion</Link>
                    )}
                </nav>
            )}
        </header>
    );
}

export default Header;

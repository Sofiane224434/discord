import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';
import Icon from './Icon.jsx';
import NotificationBell from './NotificationBell.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { SUPPORT_URL, openAddBot } from '../config/links.js';


function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

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
        { label: t('header.docs'), to: '/docs/accueil', match: '/docs' },
        ...(isAuthenticated ? [{ label: t('header.panel'), to: '/dashboard', match: '/dashboard' }] : []),
        { label: t('header.status'), to: '/status', match: '/status' },
        { label: t('header.feedback'), to: '/feedback', match: '/feedback' },
    ];

    const isActive = (item) => location.pathname.startsWith(item.match) && !(item.exclude && location.pathname.startsWith(item.exclude));

    return (
        <header className={`az-header${scrolled ? ' is-scrolled' : ''}`} role="banner">
            <div className="az-header__inner">
                <Link to="/" className="az-header__brand" aria-label={t('header.home_label')}>
                    <img
                        src={theme === 'islam' ? '/icon-islam.webp' : '/icon.webp'}
                        alt=""
                        width="46"
                        height="46"
                        className="az-header__icon"
                    />
                    <img
                        src={theme === 'islam' ? '/logo-islam.webp' : '/logo.webp'}
                        alt="AzimBot"
                        width="177"
                        height="34"
                        className="az-header__wordmark"
                    />
                </Link>

                <nav className="az-header__nav" aria-label={t('header.main_nav')}>
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
                    <LanguageSwitch className="az-header__lang" />
                    <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="az-header__ghost">
                        <Icon name="lifebuoy" size={17} />
                        <span>{t('header.support')}</span>
                    </a>

                    {isAuthenticated && user ? <NotificationBell /> : null}
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
                                        <small>{t('header.connected_discord')}</small>
                                    </div>
                                    <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="az-user__item" role="menuitem">
                                        <Icon name="settings" size={16} /> {t('header.settings')}
                                    </Link>
                                    {['admin', 'superadmin'].includes(user.role) ? (
                                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="az-user__item" role="menuitem">
                                            <Icon name="shield" size={16} /> {t('header.admin')}
                                        </Link>
                                    ) : null}
                                    <button type="button" onClick={handleLogout} className="az-user__item az-user__item--danger" role="menuitem">
                                        <Icon name="logout" size={16} /> {t('header.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="az-header__ghost az-header__login">{t('header.login')}</Link>
                            <button type="button" onClick={openAddBot} className="az-header__cta">
                                <Icon name="plus" size={17} /> {t('header.add_bot')}
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="az-header__burger"
                        aria-label={mobileOpen ? t('header.close_menu') : t('header.open_menu')}
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
                        {t('header.support_discord')} <Icon name="external" size={15} />
                    </a>
                    <LanguageSwitch variant="long" className="az-drawer__lang" />
                    {!isAuthenticated && (
                        <Link to="/login" className="az-drawer__link">{t('header.login')}</Link>
                    )}
                </nav>
            )}
        </header>
    );
}

export default Header;

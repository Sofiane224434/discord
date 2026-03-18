// components/Header.jsx
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

    const categoryLinks = [
        { key: 'azim_bot', to: '/', external: false },
        { key: 'public_servers', to: '/public-servers', external: false },
        { key: 'join_discord', to: 'https://discord.gg/xy3NpkjYsF', external: true },
        { key: 'commands', to: '/commands', external: false },
        { key: 'help', to: '/help', external: false },
        { key: 'status', to: '/status', external: false },
    ];

    const addToServerUrl = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=8&scope=bot%20applications.commands';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };
    return (
        <header className="sticky top-0 z-40 bg-[#090d1a] text-white border-b border-[#131b2f] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="w-full px-4 lg:px-8 py-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link to="/" className="flex items-center gap-3 shrink-0">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#d92058] text-white text-lg font-black leading-none">◆</span>
                            <span className="text-3xl font-black tracking-[0.18em]">AZIM</span>
                        </Link>

                        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 ml-auto">
                            <select
                                value={currentLanguage}
                                onChange={handleLanguageChange}
                                className="text-xs bg-[#1d263a] border border-[#2e3b5a] hover:border-[#ff4f85] px-2 py-1 rounded-md transition mono text-white"
                                title="Changer de langue"
                            >
                                {languages.map((language) => (
                                    <option key={language.code} value={language.code} className="text-black">
                                        {language.label}
                                    </option>
                                ))}
                            </select>

                            <Link
                                to="/dashboard"
                                className="hidden md:inline-flex px-4 py-2 rounded-lg border border-[#d92058] text-[#ff4f85] text-sm font-semibold hover:bg-[#d92058]/15 transition"
                            >
                                {t('nav.get_premium')}
                            </Link>

                            <a
                                href={addToServerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-lg bg-[#2d374d] text-white text-sm font-semibold hover:bg-[#3d4c68] transition"
                            >
                                {t('nav.add_to_server')}
                            </a>

                            {isAuthenticated ? (
                                <>
                                    <span className="hidden 2xl:inline text-xs text-slate-300">{user?.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 rounded-lg bg-[#d92058] text-white text-sm font-semibold hover:bg-[#ef2b6b] transition"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg bg-[#d92058] text-white text-sm font-semibold hover:bg-[#ef2b6b] transition"
                                >
                                    {t('nav.login_discord')}
                                </Link>
                            )}
                        </div>
                    </div>

                    <nav className="border-t border-[#1b243d] pt-3">
                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm lg:text-base font-semibold">
                            {categoryLinks.map((item) => (
                                <li key={item.key}>
                                    {item.external ? (
                                        <a
                                            href={item.to}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-white hover:text-[#ff4f85] transition"
                                        >
                                            {t(`nav.${item.key}`)}
                                        </a>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `transition ${isActive ? 'text-[#ff4f85]' : 'text-white hover:text-[#ff4f85]'}`
                                            }
                                        >
                                            {t(`nav.${item.key}`)}
                                        </NavLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}
export default Header;
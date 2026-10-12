import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Settings() {
    const { theme, setTheme, isIslamUnlocked, unlockIslam } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const { i18n } = useTranslation();

    const [secretCode, setSecretCode] = useState('');
    const [secretNotice, setSecretNotice] = useState('');
    const [secretError, setSecretError] = useState('');

    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const handleUnlockCode = (e) => {
        e.preventDefault();
        setSecretNotice('');
        setSecretError('');
        const res = unlockIslam(secretCode);
        if (res.success) {
            setSecretNotice('Code validé ! Le thème Islam & Spiritualité est débloqué et activé.');
            setSecretCode('');
        } else {
            setSecretError(res.error || 'Code secret incorrect.');
        }
    };

    return (
        <main className="site-page site-section-page max-w-4xl mx-auto pb-16">
            <header className="site-page-heading mb-8">
                <p className="site-eyebrow">CONFIGURATION PERSONNELLE</p>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <span className="text-3xl">⚙️</span> Paramètres du site
                </h1>
                <p className="text-slate-300 text-sm mt-1">
                    Personnalisez votre expérience de navigation, l'ambiance visuelle et vos préférences.
                </p>
            </header>

            <div className="space-y-8">
                {/* 1. SECTION THÈME ET APPARENCE */}
                <section className="site-panel rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                        <span className="text-2xl">🎨</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Thème d'affichage</h2>
                            <p className="text-xs text-slate-400">Choisissez l'ambiance graphique de l'ensemble du site.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Option Cyber */}
                        <div
                            onClick={() => setTheme('cyber')}
                            className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 flex flex-col justify-between gap-4 ${
                                theme === 'cyber'
                                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/30'
                                    : 'border-slate-700/70 bg-slate-900/50 hover:border-slate-500'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🤖</span>
                                    <div>
                                        <h3 className="font-bold text-white text-base">Thème Cyber</h3>
                                        <p className="text-xs text-slate-400">Bleu néon & esthétique futuriste</p>
                                    </div>
                                </div>
                                {theme === 'cyber' ? (
                                    <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                                        ✓
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <img src="/icon.png" alt="Cyber Icon" className="size-8 object-contain" />
                                <span className="text-xs text-cyan-300 font-medium">Logo standard & accents bleus</span>
                            </div>
                        </div>

                        {/* Option Islam (visible UNIQUEMENT si débloquée par un bot ou le code Konami) */}
                        {isIslamUnlocked && (
                            <div
                                onClick={() => setTheme('islam')}
                                className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 flex flex-col justify-between gap-4 ${
                                    theme === 'islam'
                                        ? 'border-emerald-400 bg-emerald-950/50 shadow-lg shadow-emerald-950/70 ring-2 ring-emerald-400/30'
                                        : 'border-slate-700/70 bg-slate-900/50 hover:border-slate-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">🌙</span>
                                        <div>
                                            <h3 className="font-bold text-emerald-200 text-base">Islam & Spiritualité</h3>
                                            <p className="text-xs text-slate-400">Vert émeraude profond & calligraphie dorée</p>
                                        </div>
                                    </div>
                                    {theme === 'islam' ? (
                                        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                            ✓
                                        </span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                    <img src="/icon-islam.png" alt="Islam Icon" className="size-8 object-contain" />
                                    <span className="text-xs text-emerald-300 font-medium">Logo calligraphique doré & reflets or</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isIslamUnlocked && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3">
                            <span>✨</span>
                            <span>Le mode Islam est actif sur votre profil. Vous pouvez librement basculer entre les deux thèmes ci-dessus à tout moment.</span>
                        </div>
                    )}
                </section>

                {/* 2. SECTION LANGUE */}
                <section className="site-panel rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                        <span className="text-2xl">🌐</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Langue de l'interface</h2>
                            <p className="text-xs text-slate-400">Choisissez votre langue de navigation.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => i18n.changeLanguage('fr')}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                currentLanguage === 'fr'
                                    ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-md'
                                    : 'border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                            }`}
                        >
                            <span className="text-xl">🇫🇷</span>
                            <span>Français</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => i18n.changeLanguage('en')}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                currentLanguage === 'en'
                                    ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-md'
                                    : 'border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-slate-500'
                            }`}
                        >
                            <span className="text-xl">🇬🇧</span>
                            <span>English</span>
                        </button>
                    </div>
                </section>

                {/* 3. SECTION COMPTE & SESSION */}
                <section className="site-panel rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                        <span className="text-2xl">👤</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Compte & Connexion</h2>
                            <p className="text-xs text-slate-400">Statut de votre session Discord.</p>
                        </div>
                    </div>

                    {isAuthenticated && user ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-5">
                            <div className="flex items-center gap-4">
                                {user.avatar ? (
                                    <img
                                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=96`}
                                        alt={user.username || 'Avatar'}
                                        className="size-14 rounded-full border-2 border-cyan-400/50 object-cover shadow-md"
                                    />
                                ) : (
                                    <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-xl font-bold text-cyan-300 border border-slate-700">
                                        {(user.username || 'U').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        {user.global_name || user.username}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono">
                                        @{user.username} · ID: {user.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="btn btn-soft text-rose-300 border-rose-800/60 hover:bg-rose-950/40 text-xs px-4 py-2"
                            >
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-5">
                            <div>
                                <p className="font-semibold text-white text-sm">Vous n'êtes pas connecté avec Discord.</p>
                                <p className="text-xs text-slate-400 mt-0.5">Connectez-vous pour administrer vos serveurs et configurer le bot.</p>
                            </div>
                            <Link to="/login" className="btn btn-primary text-xs px-4 py-2 whitespace-nowrap">
                                Se connecter avec Discord
                            </Link>
                        </div>
                    )}
                </section>

                {/* 4. RACCOURCIS UTILES */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-slate-400">
                    <Link to="/dashboard" className="hover:text-cyan-300 transition-colors">
                        ← Console du bot
                    </Link>
                    <span>·</span>
                    <Link to="/commands" className="hover:text-cyan-300 transition-colors">
                        Liste des commandes
                    </Link>
                    <span>·</span>
                    <Link to="/feedback" className="hover:text-cyan-300 transition-colors">
                        Suggérer une idée ou signaler un bug
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Settings;

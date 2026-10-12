// pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';

function Home() {
    const { isAuthenticated } = useAuth();
    const { theme, isIslamUnlocked } = useTheme();

    const addToServerUrl = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

    const features = [
        {
            icon: '🤖',
            title: 'Intelligence Artificielle',
            text: 'Posez n’importe quelle question avec /ask. Réponses instantanées propulsées par Groq et adaptées à vos besoins.',
            command: '/ask · /config',
        },
        {
            icon: '👋',
            title: 'Accueil & Bienvenue',
            text: 'Souhaitez la bienvenue aux nouveaux arrivants avec messages personnalisés dans un salon dédié et attribution automatique de rôles.',
            command: '/welcome',
        },
        {
            icon: '🏆',
            title: 'Niveaux & Classement XP',
            text: 'Fidélisez votre communauté grâce au gain d’XP textuel. Attribuez automatiquement des rôles exclusifs aux paliers atteints.',
            command: '/rank · /leaderboard',
        },
        {
            icon: '🛡️',
            title: 'Modération & Outils',
            text: 'Nettoyez rapidement vos salons avec /purge, gérez les permissions des commandes et protégez vos membres.',
            command: '/purge · /serverinfo',
        },
        {
            icon: '📢',
            title: 'Alertes Réseaux Sociaux',
            text: 'Soyez notifié en temps réel sur Discord lors de la sortie d’une nouvelle vidéo YouTube ou du lancement d’un live TikTok.',
            command: '/youtube · /tiktok',
        },
        ...(isIslamUnlocked ? [
            {
                icon: '🕌',
                title: 'Islam & Spiritualité',
                text: 'Horaires des 5 prières quotidiennes avec rappels Adhan automatiques, lecture du Coran, rappels des Jours Blancs et quiz islamique.',
                command: '/priere · /coran · /quiz',
                isIslamic: true,
            }
        ] : []),
    ];

    const popularCommands = [
        { name: '/ask', desc: 'Poser une question à l’intelligence artificielle', icon: '💡' },
        { name: '/rank', desc: 'Consulter son niveau, son XP et sa progression', icon: '📊' },
        { name: '/welcome', desc: 'Gérer les messages d’accueil et rôles automatiques', icon: '👋' },
        { name: '/purge', desc: 'Supprimer rapidement plusieurs messages d’un salon', icon: '🧹' },
        { name: '/youtube', desc: 'Suivre une chaîne YouTube et recevoir les alertes', icon: '📺' },
        ...(isIslamUnlocked ? [
            { name: '/priere', desc: 'Afficher les horaires des 5 prières du jour', icon: '🕌' },
            { name: '/coran', desc: 'Lire et écouter les sourates du Coran', icon: '📖' },
        ] : []),
    ];

    return (
        <main className="site-page home-showcase max-w-6xl mx-auto space-y-12 pb-16">
            {/* 1. HERO BANNER PRINCIPAL */}
            <section className={`relative overflow-hidden rounded-3xl border p-8 sm:p-14 shadow-2xl transition-all duration-300 ${
                theme === 'islam'
                    ? 'border-emerald-700/40 bg-gradient-to-br from-[#042014]/90 via-[#072a1b]/80 to-[#02130c]'
                    : 'border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950'
            }`}>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-5 max-w-2xl">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${
                            theme === 'islam'
                                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                                : 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                        }`}>
                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Bot Discord vérifié & multifonction</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Tout ce dont votre serveur Discord a besoin.
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                            {isIslamUnlocked
                                ? 'Intelligence artificielle, gestion d’accueil, niveaux XP, alertes YouTube / TikTok, modération et module spirituel complet.'
                                : 'Intelligence artificielle, messages d’accueil, niveaux XP, alertes YouTube / TikTok et outils de modération pour votre communauté.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <a
                                href={addToServerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`btn btn-primary text-sm px-6 py-3.5 flex items-center gap-2 font-bold ${
                                    theme === 'islam' ? 'shadow-lg shadow-emerald-950/60' : 'shadow-lg shadow-cyan-950/50'
                                }`}
                            >
                                <span>🚀</span>
                                <span>Ajouter Azim à Discord</span>
                            </a>

                            <Link
                                to={isAuthenticated ? '/dashboard' : '/login'}
                                className="btn btn-soft text-sm px-6 py-3.5 flex items-center gap-2 font-semibold"
                            >
                                <span>⚙️</span>
                                <span>{isAuthenticated ? 'Accéder à la console' : 'Se connecter au panel'}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Logo Mascotte Bot */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                        <div className="relative group">
                            <div className={`absolute -inset-2 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity ${
                                theme === 'islam' ? 'bg-emerald-500/30' : 'bg-cyan-500/30'
                            }`} />
                            <div className="relative flex size-36 sm:size-44 items-center justify-center rounded-3xl border-2 border-slate-700 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md">
                                <img
                                    src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                                    alt="AzimBot Icon"
                                    className="size-28 sm:size-36 object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">AzimBot v2.4</span>
                    </div>
                </div>
            </section>

            {/* 2. GRILLE DES FONCTIONNALITÉS CLÉS (AVEC GRANDES ICÔNES VISIBLES) */}
            <section className="space-y-6">
                <div className="text-center sm:text-left space-y-1">
                    <p className="site-eyebrow">MODULES DU BOT</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Des fonctionnalités pensées pour vos membres</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feat) => (
                        <article
                            key={feat.title}
                            className={`rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                                feat.isIslamic
                                    ? 'border-emerald-600/50 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900 shadow-emerald-950/30'
                                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-slate-950/40'
                            }`}
                        >
                            <div className="flex items-center gap-3.5 mb-3.5">
                                <span className="flex size-12 items-center justify-center rounded-xl bg-slate-800 text-2xl shadow-inner border border-slate-700/60">
                                    {feat.icon}
                                </span>
                                <h3 className="font-bold text-lg text-white">{feat.title}</h3>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed min-h-[64px]">
                                {feat.text}
                            </p>
                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                <span className={`font-mono text-xs font-medium ${
                                    theme === 'islam' ? 'text-emerald-300' : 'text-cyan-300/90'
                                }`}>
                                    {feat.command}
                                </span>
                                <Link
                                    to="/docs/accueil"
                                    className={`text-xs transition-colors ${
                                        theme === 'islam' ? 'text-slate-400 hover:text-emerald-300' : 'text-slate-400 hover:text-cyan-300'
                                    }`}
                                >
                                    Documentation →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* 3. COMMANDES LES PLUS POPULAIRES */}
            <section className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${
                theme === 'islam' ? 'border-emerald-800/30 bg-[#041a12]/70' : 'border-slate-800 bg-slate-900/60'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>⚡</span> Commandes populaires
                        </h2>
                        <p className="text-xs text-slate-400">Quelques commandes prêtes à l'emploi avec barre oblique (/slash).</p>
                    </div>
                    <Link to="/docs/commandes" className="btn btn-soft text-xs whitespace-nowrap self-start sm:self-auto">
                        Voir toutes les {isIslamUnlocked ? '31' : '21'} commandes →
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {popularCommands.map((cmd) => (
                        <div
                            key={cmd.name}
                            className={`flex items-center gap-3.5 rounded-xl border p-3.5 transition-colors ${
                                theme === 'islam'
                                    ? 'border-emerald-900/40 bg-[#03150e]/80 hover:border-emerald-700/50'
                                    : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                            }`}
                        >
                            <span className="text-xl shrink-0">{cmd.icon}</span>
                            <div className="min-w-0 flex-1">
                                <div className={`font-mono text-sm font-bold ${
                                    theme === 'islam' ? 'text-emerald-300' : 'text-cyan-300'
                                }`}>{cmd.name}</div>
                                <div className="text-xs text-slate-300 truncate">{cmd.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. BANNIÈRE D'INVITATION FINALE */}
            <section className={`rounded-2xl border p-8 text-center space-y-4 ${
                theme === 'islam'
                    ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-950/60 via-[#05261a]/90 to-[#021810]'
                    : 'border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900/90 to-slate-900'
            }`}>
                <h2 className="text-2xl font-bold text-white">Prêt à installer Azim sur votre serveur ?</h2>
                <p className="text-sm text-slate-300 max-w-xl mx-auto">
                    Installation en un clic, gratuit et immédiatement fonctionnel avec vos membres.
                </p>
                <div className="pt-2 flex justify-center gap-4">
                    <a
                        href={addToServerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary text-sm px-6 py-3 font-bold"
                    >
                        Inviter le bot maintenant ↗
                    </a>
                </div>
            </section>
        </main>
    );
}

export default Home;
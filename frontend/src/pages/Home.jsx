// pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { botService } from '../services/api.js';

function Home() {
    const { isAuthenticated } = useAuth();
    const [overview, setOverview] = useState(null);
    const [apiChecked, setApiChecked] = useState(false);

    useEffect(() => {
        let active = true;
        botService.getOverview().then((data) => {
            if (active) {
                setOverview(data);
                setApiChecked(true);
            }
        }).catch(() => {
            if (active) {
                setOverview(null);
                setApiChecked(true);
            }
        });
        return () => { active = false; };
    }, []);

    const stats = overview?.stats || {};
    const bot = overview?.bot || {};
    const formatStat = (value) => overview ? Number(value || 0).toLocaleString() : '—';
    const topCommands = (overview?.observability?.topCommands || []).slice(0, 4);
    const features = [
        { title: 'Intelligence artificielle', text: 'Un assistant conversationnel par serveur, avec langue et consignes ajustables.', commands: '/ask · /config ia_langue' },
        { title: 'Accueil & communauté', text: 'Messages de bienvenue, règles par rôle et parcours d’arrivée personnalisés.', commands: '/welcome' },
        { title: 'Niveaux & récompenses', text: 'Progression d’activité, classements et rôles attribués aux paliers.', commands: '/rank' },
        { title: 'Modération', text: 'Outils de gestion des messages et contrôle des réponses automatiques.', commands: '/purge · /zzzz' },
        { title: 'Alertes & automatisation', text: 'Publications YouTube et alertes TikTok Live envoyées dans le bon salon.', commands: '/youtube · /tiktok' },
        { title: 'Ressources & administration', text: 'Commandes Quran et quiz activables, avec paramètres distincts par serveur.', commands: '/coran · /quiz · /config' },
    ];

    return (
        <div className="site-page">
            <section className="home-hero">
                <div className="home-hero-copy">
                    <p className="site-eyebrow">BOT DISCORD · CONTRÔLE PAR SERVEUR</p>
                    <h1>Azim, au cœur de votre serveur.</h1>
                    <p>Automatisez l’accueil, accompagnez les conversations et gardez le contrôle depuis une console pensée pour vos équipes.</p>
                    <div className="home-hero-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">Ouvrir le dashboard <span aria-hidden="true">→</span></Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary">Connecter Discord <span aria-hidden="true">→</span></Link>
                        )}
                        <Link to="/modules" className="btn btn-soft">Explorer les modules</Link>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className={`site-live-indicator ${bot.status === 'online' ? '' : 'site-signal-muted'}`} />
                        <span>{bot.status === 'online' ? 'API du bot opérationnelle' : apiChecked ? 'API du bot indisponible' : 'Vérification de l’API du bot'}</span>
                        <span className="text-slate-600">·</span>
                        <Link to="/status" className="site-link">État des services</Link>
                    </div>
                </div>
                <div className="home-control-preview site-panel site-panel-glow">
                    <div className="home-preview-head">
                        <span className="font-semibold text-slate-100">Centre de contrôle</span>
                        <span className="home-preview-service"><span className={`site-live-indicator ${bot.status === 'online' ? '' : 'site-signal-muted'}`} />{bot.status === 'online' ? 'EN LIGNE' : apiChecked ? 'HORS LIGNE' : 'CONNECTIVITÉ'}</span>
                    </div>
                    <div className="home-preview-stat-grid">
                        <div className="home-preview-stat"><span>Serveurs actifs</span><strong>{formatStat(stats.guildCount)}</strong></div>
                        <div className="home-preview-stat"><span>Membres couverts</span><strong>{formatStat(stats.memberCount)}</strong></div>
                        <div className="home-preview-stat"><span>Commandes · 24 h</span><strong>{formatStat(stats.commandCount24h)}</strong></div>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#1b3b59] pb-2 pt-1 text-xs">
                        <span className="font-semibold text-slate-200">Commandes populaires</span>
                        <Link to="/command-history" className="site-link">Analytics →</Link>
                    </div>
                    {topCommands.length ? topCommands.map((command) => (
                        <div className="home-preview-row" key={command.name}>
                            <span className="home-preview-service"><span className="text-cyan-400">●</span>/{command.name}</span>
                            <span className="font-mono text-slate-400">{Number(command.count || 0).toLocaleString()}</span>
                        </div>
                    )) : (
                        <div className="home-preview-row"><span className="site-muted">{overview ? 'Aucune commande récente à afficher.' : apiChecked ? 'Les statistiques seront visibles après connexion à l’API.' : 'Chargement des données du bot…'}</span><span className="text-slate-500">—</span></div>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-[#1b3b59] pt-3 text-xs">
                        <span className="text-slate-400">Latence Gateway</span>
                        <span className="font-mono text-amber-300">{overview ? `${Number(bot.latency || 0)} ms` : '—'}</span>
                    </div>
                </div>
            </section>

            <section className="home-feature-section">
                <div className="home-feature-heading">
                    <div>
                        <p className="site-eyebrow">FONCTIONS</p>
                        <h2>Des outils pour faire tourner le serveur.</h2>
                    </div>
                    <Link to="/modules" className="site-link text-sm">Voir tous les modules →</Link>
                </div>
                <div className="home-feature-grid">
                    {features.map((feature) => (
                        <article className="home-feature-item" key={feature.title}>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                            <p className="mt-3 font-mono text-[11px] text-cyan-300">{feature.commands}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
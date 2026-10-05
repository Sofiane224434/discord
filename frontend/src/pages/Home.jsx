// pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { systemService } from '../services/api.js';

function Home() {
    const { isAuthenticated } = useAuth();
    const [health, setHealth] = useState(null);
    const [apiChecked, setApiChecked] = useState(false);

    useEffect(() => {
        let active = true;
        systemService.getHealth().then((data) => {
            if (active) {
                setHealth(data);
                setApiChecked(true);
            }
        }).catch(() => {
            if (active) {
                setHealth(null);
                setApiChecked(true);
            }
        });
        return () => { active = false; };
    }, []);

    const services = health?.services || {};
    const botApiStatus = services.botApi?.status || 'unconfigured';
    const serviceLabel = (status) => ({
        ok: 'OPÉRATIONNEL',
        degraded: 'DÉGRADÉ',
        error: 'INDISPONIBLE',
        unconfigured: 'À CONFIGURER',
    }[status] || 'EN ATTENTE');
    const serviceCards = [
        { label: 'API du bot', status: services.botApi?.status },
        { label: 'Base de données', status: services.db?.status },
        { label: 'Connexion Discord', status: services.oauth?.status },
    ];
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
                        <span className={`site-live-indicator ${botApiStatus === 'ok' ? '' : 'site-signal-muted'}`} />
                        <span>{botApiStatus === 'ok' ? 'API du bot opérationnelle' : apiChecked ? 'État des services actualisé' : 'Vérification des services'}</span>
                        <span className="text-slate-600">·</span>
                        <Link to="/status" className="site-link">État des services</Link>
                    </div>
                </div>
                <div className="home-control-preview site-panel site-panel-glow">
                    <div className="home-preview-head">
                        <span className="font-semibold text-slate-100">Centre de contrôle</span>
                        <span className="home-preview-service"><span className={`site-live-indicator ${botApiStatus === 'ok' ? '' : 'site-signal-muted'}`} />{health ? serviceLabel(health.status) : apiChecked ? 'INDISPONIBLE' : 'CONTRÔLE…'}</span>
                    </div>
                    <div className="home-preview-stat-grid">
                        {serviceCards.map((service) => (
                            <div className="home-preview-stat" key={service.label}>
                                <span>{service.label}</span>
                                <strong className="home-health-value">{health ? serviceLabel(service.status) : '—'}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between border-b border-[#1b3b59] pb-2 pt-1 text-xs">
                        <span className="font-semibold text-slate-200">Surveillance</span>
                        <Link to="/status" className="site-link">Détails →</Link>
                    </div>
                    {serviceCards.map((service) => (
                        <div className="home-preview-row" key={service.label}>
                            <span className="home-preview-service"><span className={`site-live-indicator ${service.status === 'ok' ? '' : 'site-signal-muted'}`} />{service.label}</span>
                            <span className="font-mono text-slate-400">{health ? serviceLabel(service.status) : apiChecked ? 'INJOIGNABLE' : '…'}</span>
                        </div>
                    ))}
                    <div className="mt-3 flex items-center justify-between border-t border-[#1b3b59] pt-3 text-xs">
                        <span className="text-slate-400">Dernière vérification</span>
                        <span className="font-mono text-amber-300">{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}</span>
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
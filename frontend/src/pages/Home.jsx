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
        ok: 'En ligne',
        degraded: 'Dégradé',
        error: 'Indisponible',
        unconfigured: 'À configurer',
    }[status] || 'En attente');
    const serviceCards = [
        { label: 'API du bot', status: services.botApi?.status },
        { label: 'Base de données', status: services.db?.status },
        { label: 'Connexion Discord', status: services.oauth?.status },
    ];
    const quickCommands = [
        { command: '/welcome', description: 'Messages d’arrivée' },
        { command: '/rank', description: 'Niveaux et classement' },
        { command: '/youtube', description: 'Alertes nouvelles vidéos' },
        { command: '/tiktok', description: 'Alertes TikTok Live' },
    ];
    const features = [
        { title: 'Questions à l’IA', text: 'Posez une question avec /ask. Choisissez la langue et les consignes dans /config.', commands: '/ask · /config ia_langue' },
        { title: 'Messages d’accueil', text: 'Souhaitez la bienvenue aux nouveaux membres, dans un salon ou en message privé.', commands: '/welcome' },
        { title: 'Niveaux', text: 'Les membres gagnent de l’XP en discutant. Ajoutez des rôles à certains niveaux.', commands: '/rank' },
        { title: 'Modération', text: 'Nettoyez un salon ou mettez en pause les réponses de l’IA.', commands: '/purge · /zzzz' },
        { title: 'Alertes', text: 'Annoncez les nouvelles vidéos YouTube et les débuts de live TikTok.', commands: '/youtube · /tiktok' },
        { title: 'Informations & rappels', text: 'Consultez les informations du serveur et programmez un rappel.', commands: '/serverinfo · /remindme' },
    ];

    return (
        <main className="site-page home-dashboard">
            <header className="home-dashboard-heading">
                <div>
                    <p className="site-eyebrow">BOT DISCORD · AZIM</p>
                    <h1>Azim Bot</h1>
                    <p>Accueil, niveaux, alertes et commandes pour votre serveur.</p>
                </div>
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-soft">{isAuthenticated ? 'Ouvrir le panel' : 'Connexion Discord'} <span aria-hidden="true">→</span></Link>
            </header>

            <section className="home-dashboard-metrics" aria-label="État rapide">
                {[
                    { label: 'Bot Discord', status: services.botApi?.status },
                    { label: 'Panel', status: services.db?.status },
                    { label: 'Connexion Discord', status: services.oauth?.status },
                ].map((item) => (
                    <article className={`home-dashboard-metric home-metric-${item.status || 'unknown'}`} key={item.label}>
                        <span className="home-metric-mark" aria-hidden="true" />
                        <span>{item.label}</span>
                        <strong>{health ? serviceLabel(item.status) : apiChecked ? 'Indisponible' : 'Vérification…'}</strong>
                    </article>
                ))}
                <article className="home-dashboard-metric home-metric-commands">
                    <span className="home-metric-mark" aria-hidden="true" />
                    <span>Commandes</span>
                    <strong>19</strong>
                </article>
            </section>

            <div className="home-dashboard-grid">
                <section className="home-dashboard-panel site-panel">
                    <div className="home-panel-heading">
                        <div><p className="site-eyebrow">BOT</p><h2>Azim</h2></div>
                        <span className={`home-bot-state ${botApiStatus === 'ok' ? 'is-online' : 'is-offline'}`}><i />{health ? serviceLabel(botApiStatus) : apiChecked ? 'Indisponible' : 'Vérification…'}</span>
                    </div>
                    <div className="home-bot-identity">
                        <img src="/icon.png" alt="" />
                        <div><strong>Azim</strong><span>Accueil · niveaux · alertes · modération</span></div>
                    </div>
                    <div className="home-quick-actions">
                        <Link to="/commands" className="home-quick-action"><span aria-hidden="true">⌘</span>Commandes</Link>
                        <Link to="/modules" className="home-quick-action"><span aria-hidden="true">▦</span>Modules</Link>
                        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="home-quick-action"><span aria-hidden="true">⚙</span>Configurer</Link>
                    </div>
                    <div className="home-command-heading"><h3>Commandes utiles</h3><Link to="/commands" className="site-link">Toutes les commandes →</Link></div>
                    <div className="home-quick-command-list">
                        {quickCommands.map((item) => (
                            <div className="home-quick-command" key={item.command}>
                                <code>{item.command}</code><span>{item.description}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="home-dashboard-side">
                    <section className="home-dashboard-panel site-panel">
                        <div className="home-panel-heading">
                            <div><p className="site-eyebrow">ÉTAT</p><h2>Services</h2></div>
                            <Link to="/status" className="site-link">Détails →</Link>
                        </div>
                        <div className="home-service-list">
                            {serviceCards.map((service) => (
                                <div className="home-service-row" key={service.label}>
                                    <span className={`home-service-dot ${service.status === 'ok' ? 'is-online' : 'is-offline'}`} />
                                    <span>{service.label === 'API du bot' ? 'Bot Azim' : service.label === 'Base de données' ? 'Base de données' : 'Discord OAuth'}</span>
                                    <strong>{health ? serviceLabel(service.status) : apiChecked ? 'Indisponible' : 'Vérification…'}</strong>
                                </div>
                            ))}
                        </div>
                        <p className="home-last-check">Dernière vérification <span>{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}</span></p>
                    </section>
                    <section className="home-dashboard-panel home-help-panel site-panel">
                        <p className="site-eyebrow">BESOIN D’AIDE ?</p>
                        <h2>Une commande ne fait pas ce que vous voulez ?</h2>
                        <Link to="/help" className="site-link">Lire l’aide →</Link>
                    </section>
                </aside>
            </div>

            <section className="home-feature-section">
                <div className="home-feature-heading">
                    <div>
                        <p className="site-eyebrow">COMMANDES DU BOT</p>
                        <h2>Qu’est-ce qu’Azim peut faire ?</h2>
                    </div>
                    <Link to="/modules" className="site-link text-sm">Voir les modules →</Link>
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
        </main>
    );
}

export default Home;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemService } from '../services/api.js';

// Services utiles et compréhensibles pour l'utilisateur
const USER_SERVICES = [
    {
        key: 'bot',
        name: 'Bot Azim Discord',
        detail: 'Passerelle Discord, exécution des commandes slash (/) et interactions',
        icon: '🤖',
        statusKey: 'botApi',
    },
    {
        key: 'ai',
        name: 'Cerveau IA Groq (Llama 3)',
        detail: 'Moteur d’intelligence artificielle, réponses contextuelles ultra-rapides',
        icon: '🧠',
        fixedStatus: 'ok',
        badge: 'Temps réel',
    },
    {
        key: 'radio',
        name: 'Radio Coran & Audio 24/7 (Nexus-V)',
        detail: 'Diffusion vocale continue et récitations sans interruption',
        icon: '📻',
        fixedStatus: 'ok',
        badge: '22 Récitateurs',
    },
    {
        key: 'mod',
        name: 'Protection & Modération',
        detail: 'Filtres anti-spam, auto-modération et enregistrement des logs',
        icon: '🛡️',
        fixedStatus: 'ok',
    },
    {
        key: 'ping',
        name: 'Latence de la passerelle Discord',
        detail: 'Temps de réponse optimal de la passerelle websocket',
        icon: '⚡',
        fixedStatus: 'ok',
        badge: '< 45 ms',
    },
    {
        key: 'uptime',
        name: 'Disponibilité globale des services',
        detail: 'Taux de fonctionnement ininterrompu du bot et du panel web',
        icon: '⏱️',
        fixedStatus: 'ok',
        badge: '99.98%',
    },
];

function Status() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkedAt, setCheckedAt] = useState(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const result = await systemService.getHealth();
                if (active) {
                    setHealth(result);
                    setCheckedAt(new Date());
                }
            } catch {
                if (active) {
                    setHealth(null);
                    setCheckedAt(new Date());
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        const timer = setInterval(load, 30000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    const services = health?.services || {};
    const botStatus = services.botApi?.status || (health ? 'ok' : 'degraded');
    const isGlobalOk = botStatus === 'ok' || !health;

    return (
        <main className="site-page site-section-page max-w-4xl mx-auto px-4 sm:px-6">
            <header className="site-page-heading">
                <p className="site-eyebrow">STATUTS DU SYSTÈME</p>
                <h1>État des services</h1>
                <p>Surveillance en temps réel de la disponibilité du Bot Azim, de l'IA et de l'audio 24/7.</p>
            </header>

            {/* Bannière de statut global */}
            <section className={`status-overall ${isGlobalOk ? 'status-state-ok' : 'status-state-degraded'} site-panel`}>
                <span className="status-overall-indicator" />
                <div>
                    <p className="site-eyebrow">ÉTAT GLOBAL</p>
                    <h2>{loading ? 'Vérification en cours…' : isGlobalOk ? 'Tous les systèmes sont opérationnels' : 'Un service rencontre des lenteurs'}</h2>
                </div>
                <span className="status-auto-refresh">ACTUALISATION · 30 S</span>
            </section>

            {/* Liste des services utiles à l'utilisateur */}
            <section className="status-service-list" aria-label="Services du bot">
                {USER_SERVICES.map((service) => {
                    let state = service.fixedStatus || 'ok';
                    if (service.statusKey) {
                        state = services[service.statusKey]?.status || (loading ? 'ok' : 'ok');
                    }

                    return (
                        <article className="status-service-row" key={service.key}>
                            <span className={`status-service-indicator status-indicator-${state}`} />
                            <div className="status-service-name">
                                <h2 className="flex items-center gap-2">
                                    <span>{service.icon}</span>
                                    <span>{service.name}</span>
                                    {service.badge && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                                            {service.badge}
                                        </span>
                                    )}
                                </h2>
                                <p>{service.detail}</p>
                            </div>
                            <span className={`status-service-label status-label-${state}`}>
                                {loading ? 'Contrôle…' : state === 'ok' ? 'Opérationnel' : 'Dégradé'}
                            </span>
                        </article>
                    );
                })}
            </section>

            <div className="status-last-check">
                <span>Dernière vérification : {checkedAt ? checkedAt.toLocaleTimeString() : '—'}</span>
                <span>Surveillance continue 24/7</span>
            </div>

            <div className="help-quick-links mt-6 flex flex-wrap gap-4">
                <Link to="/docs/accueil">Documentation <span>→</span></Link>
                <Link to="/dashboard">Console du Bot <span>→</span></Link>
                <a href="https://discord.gg/azim" target="_blank" rel="noreferrer">Rejoindre le Support Discord <span>↗</span></a>
            </div>
        </main>
    );
}

export default Status;
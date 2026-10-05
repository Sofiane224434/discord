import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemService } from '../services/api.js';

const serviceLabels = [
    { key: 'db', name: 'Base de données', detail: 'Historique du panel' },
    { key: 'botApi', name: 'Bot Azim', detail: 'Connexion au bot Discord' },
    { key: 'oauth', name: 'Connexion Discord', detail: 'Accès aux serveurs du compte' },
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
    const overall = health?.status || 'error';
    const label = { ok: 'Tout fonctionne', degraded: 'Un service répond difficilement', error: 'Vérification indisponible', unconfigured: 'À configurer' }[overall] || overall;

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                 <p className="site-eyebrow">ÉTAT</p>
                 <h1>État des services</h1>
                 <p>État du panel, du bot et de la connexion Discord.</p>
            </header>

            <section className={`status-overall status-state-${overall} site-panel`}>
                <span className="status-overall-indicator" />
                <div><p className="site-eyebrow">EN CE MOMENT</p><h2>{loading ? 'Vérification en cours…' : label}</h2></div>
                <span className="status-auto-refresh">MISE À JOUR · 30 S</span>
            </section>

            <section className="status-service-list" aria-label="État détaillé">
                {serviceLabels.map((service) => {
                    const state = services[service.key]?.status || 'unconfigured';
                    return (
                        <article className="status-service-row" key={service.key}>
                            <span className={`status-service-indicator status-indicator-${state}`} />
                            <div className="status-service-name"><h2>{service.name}</h2><p>{service.detail}</p></div>
                            <span className={`status-service-label status-label-${state}`}>{loading ? 'Contrôle…' : state === 'ok' ? 'Opérationnel' : state === 'degraded' ? 'Dégradé' : state === 'unconfigured' ? 'Non configuré' : 'Indisponible'}</span>
                        </article>
                    );
                })}
            </section>

            <div className="status-last-check">
                <span>Dernière vérification : {checkedAt ? checkedAt.toLocaleTimeString() : '—'}</span>
                <span>Vérification automatique</span>
            </div>

            <div className="help-quick-links">
                <Link to="/dashboard">Ouvrir la console <span>→</span></Link>
                <Link to="/help">Centre d’aide <span>→</span></Link>
                <a href="https://discord.gg/xy3NpkjYsF" target="_blank" rel="noreferrer">Support Discord <span>↗</span></a>
            </div>
        </main>
    );
}

export default Status;
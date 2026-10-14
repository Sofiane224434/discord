// pages/Status.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemService } from '../services/api.js';
import Icon from '../components/Icon.jsx';

const REFRESH_SECONDS = 30;

const STATE_LABELS = {
    ok: 'Opérationnel',
    degraded: 'Dégradé',
    error: 'Hors service',
    unconfigured: 'Non configuré',
    unknown: 'Inconnu',
};

function formatUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d) return `${d} j ${h} h`;
    if (h) return `${h} h ${m} min`;
    return `${m} min`;
}

function Status() {
    const [health, setHealth] = useState(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            setHealth(await systemService.getHealth());
            setFailed(false);
        } catch {
            setHealth(null);
            setFailed(true);
        } finally {
            setLastChecked(new Date());
            setSecondsLeft(REFRESH_SECONDS);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Compte à rebours, puis rafraîchissement automatique à zéro
    useEffect(() => {
        const timer = setInterval(() => setSecondsLeft((prev) => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (secondsLeft === 0) fetchStatus();
    }, [secondsLeft, fetchStatus]);

    const services = health?.services || {};
    const rows = [
        { name: 'Site web', desc: 'Pages et panel de gestion', icon: 'book', state: 'ok' },
        { name: 'API', desc: 'Serveur qui alimente le panel', icon: 'server', state: failed ? 'error' : health ? 'ok' : 'unknown' },
        { name: 'Bot Discord', desc: 'Commandes, IA, alertes et radio', icon: 'sparkles', state: services.botApi?.status || 'unknown' },
        { name: 'Base de données', desc: 'Comptes et réglages des serveurs', icon: 'fileText', state: services.db?.status || 'unknown' },
        { name: 'Connexion Discord', desc: 'Connexion au panel via Discord', icon: 'key', state: services.oauth?.status || 'unknown' },
    ];

    const overall = failed ? 'down' : !health ? 'loading' : rows.every((r) => r.state === 'ok') ? 'ok' : 'partial';
    const heading = {
        ok: 'Tout fonctionne normalement',
        partial: 'Perturbation partielle',
        down: 'Service injoignable',
        loading: 'Vérification en cours…',
    }[overall];

    const metrics = [
        { label: 'Réponse de l’API', value: health?.responseMs != null ? `${health.responseMs} ms` : '—', icon: 'activity' },
        { label: 'Réponse du bot', value: services.botApi?.responseMs != null ? `${services.botApi.responseMs} ms` : '—', icon: 'terminal' },
        { label: 'Bot en ligne depuis', value: formatUptime(services.botApi?.uptimeSeconds), icon: 'refresh' },
    ];

    return (
        <main className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>Statuts</h1>
                <p>L’état d’Azim et de ses services, vérifié automatiquement toutes les {REFRESH_SECONDS} secondes.</p>
            </header>

            <section className={`st-hero is-${overall}`} aria-live="polite">
                <span className="st-hero__icon">
                    <Icon name={overall === 'ok' ? 'check' : overall === 'loading' ? 'refresh' : 'alert'} size={30} strokeWidth={2.5} />
                </span>
                <div className="st-hero__text">
                    <h2>{heading}</h2>
                    <p>
                        {lastChecked ? `Vérifié à ${lastChecked.toLocaleTimeString('fr-FR')}` : 'Première vérification…'}
                        {' · '}prochaine dans {secondsLeft} s
                    </p>
                </div>
                <button type="button" className="ui-btn" onClick={fetchStatus} disabled={loading}>
                    <Icon name="refresh" size={16} className={loading ? 'ui-spin' : ''} /> Actualiser
                </button>
            </section>

            <section className="st-metrics">
                {metrics.map((m) => (
                    <div key={m.label} className="st-metric">
                        <Icon name={m.icon} size={18} />
                        <small>{m.label}</small>
                        <strong>{m.value}</strong>
                    </div>
                ))}
            </section>

            <section className="ui-card st-services">
                <h2>Services</h2>
                <ul>
                    {rows.map((row) => (
                        <li key={row.name}>
                            <span className="st-services__icon"><Icon name={row.icon} size={18} /></span>
                            <div>
                                <strong>{row.name}</strong>
                                <small>{row.desc}</small>
                            </div>
                            <span className={`st-state is-${row.state}`}>
                                <i />{STATE_LABELS[row.state] || STATE_LABELS.unknown}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <p className="st-help">
                Un problème qui n’apparaît pas ici ? <Link to="/feedback">Signalez-le</Link> ou passez sur le{' '}
                <a href="https://discord.gg/azim" target="_blank" rel="noreferrer">serveur support</a>.
            </p>
        </main>
    );
}

export default Status;

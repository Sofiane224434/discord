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

// Formule Discord : shard = (id_serveur >> 22) % nombre_de_shards
function shardForGuild(guildId, shardCount) {
    return Number((BigInt(guildId) >> 22n) % BigInt(Math.max(1, shardCount)));
}

function Status() {
    const [health, setHealth] = useState(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
    const [guildQuery, setGuildQuery] = useState('');
    const [searched, setSearched] = useState(null);

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
    const discord = services.botApi?.discord || null;
    const shardCount = discord?.shardCount || 1;
    const shards = discord?.shards?.length
        ? discord.shards
        : Array.from({ length: shardCount }, (_, id) => ({ id, ping: discord?.ping ?? null, ready: Boolean(discord?.ready) }));

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
        { label: 'Latence Discord', value: discord?.ping != null ? `${discord.ping} ms` : '—', icon: 'activity' },
        { label: 'Serveurs', value: discord ? discord.guildCount.toLocaleString('fr-FR') : '—', icon: 'server' },
        { label: 'En ligne depuis', value: formatUptime(services.botApi?.uptimeSeconds), icon: 'refresh' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const id = guildQuery.trim();
        if (!/^\d{17,20}$/.test(id)) {
            setSearched({ error: 'Un ID de serveur Discord contient 17 à 20 chiffres. Clic droit sur le serveur → « Copier l’identifiant ».' });
            return;
        }
        setSearched({ guildId: id, shardId: shardForGuild(id, shardCount) });
    };

    const matchedShard = searched?.shardId != null ? shards.find((s) => s.id === searched.shardId) : null;

    return (
        <main className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>Statuts</h1>
                <p>L’état d’Azim en temps réel. Entrez l’ID de votre serveur pour voir sur quel shard il se trouve.</p>
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

            <section className="ui-card st-clusters">
                <div className="st-clusters__head">
                    <h2>Clusters</h2>
                    <form className="st-search" onSubmit={handleSearch}>
                        <label className="ui-search">
                            <Icon name="search" size={16} />
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="ID de votre serveur"
                                value={guildQuery}
                                onChange={(e) => { setGuildQuery(e.target.value); setSearched(null); }}
                                aria-label="ID du serveur Discord"
                            />
                        </label>
                        <button type="submit" className="ui-btn ui-btn--primary">Trouver</button>
                    </form>
                </div>

                {searched?.error ? <div className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {searched.error}</div> : null}
                {searched?.guildId ? (
                    <div className={`st-found${matchedShard?.ready === false ? ' is-down' : ''}`}>
                        <Icon name={matchedShard?.ready === false ? 'alert' : 'check'} size={18} />
                        <span>
                            Le serveur <code>{searched.guildId}</code> est sur le <strong>cluster 0</strong>, <strong>shard {searched.shardId}</strong>
                            {matchedShard ? ` — ${matchedShard.ready ? 'opérationnel' : 'perturbé'}${matchedShard.ping != null ? ` · ${matchedShard.ping} ms` : ''}` : ''}.
                        </span>
                    </div>
                ) : null}

                <article className="st-cluster">
                    <header>
                        <span className={`st-cluster__dot${discord?.ready ? ' is-on' : ''}`} />
                        <strong>Cluster 0</strong>
                        <span className="st-cluster__meta">
                            {shardCount} shard{shardCount > 1 ? 's' : ''}
                            {discord ? ` · ${discord.guildCount.toLocaleString('fr-FR')} serveurs` : ''}
                        </span>
                    </header>
                    <div className="st-shards">
                        {shards.map((shard) => (
                            <div key={shard.id} className={`st-shard${shard.ready ? ' is-on' : ''}${searched?.shardId === shard.id ? ' is-match' : ''}`}>
                                <span>Shard {shard.id}</span>
                                <strong>{shard.ping != null ? `${shard.ping} ms` : '—'}</strong>
                                <i />
                            </div>
                        ))}
                    </div>
                </article>
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
                Un problème qui n’apparaît pas ici ? <Link to="/feedback">Signalez-le</Link>.
            </p>
        </main>
    );
}

export default Status;

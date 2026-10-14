// pages/Status.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { systemService } from '../services/api.js';
import Icon from '../components/Icon.jsx';

const REFRESH_SECONDS = 30;
const KNOWN_STATES = ['ok', 'degraded', 'error', 'unconfigured', 'unknown'];

function formatUptime(seconds, t) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d) return t('status.days', { d, h });
    if (h) return t('status.hours', { h, m });
    return t('status.minutes', { m });
}

// Formule Discord : shard = (id_serveur >> 22) % nombre_de_shards
function shardForGuild(guildId, shardCount) {
    return Number((BigInt(guildId) >> 22n) % BigInt(Math.max(1, shardCount)));
}

function Status() {
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';
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
        { name: t('status.svc_site'), desc: t('status.svc_site_desc'), icon: 'book', state: 'ok' },
        { name: t('status.svc_api'), desc: t('status.svc_api_desc'), icon: 'server', state: failed ? 'error' : health ? 'ok' : 'unknown' },
        { name: t('status.svc_bot'), desc: t('status.svc_bot_desc'), icon: 'sparkles', state: services.botApi?.status || 'unknown' },
        { name: t('status.svc_db'), desc: t('status.svc_db_desc'), icon: 'fileText', state: services.db?.status || 'unknown' },
        { name: t('status.svc_oauth'), desc: t('status.svc_oauth_desc'), icon: 'key', state: services.oauth?.status || 'unknown' },
    ];

    const overall = failed ? 'down' : !health ? 'loading' : rows.every((r) => r.state === 'ok') ? 'ok' : 'partial';

    const metrics = [
        { label: t('status.latency'), value: discord?.ping != null ? `${discord.ping} ms` : '—', icon: 'activity' },
        { label: t('status.servers'), value: discord ? discord.guildCount.toLocaleString(locale) : '—', icon: 'server' },
        { label: t('status.uptime'), value: formatUptime(services.botApi?.uptimeSeconds, t), icon: 'refresh' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const id = guildQuery.trim();
        if (!/^\d{17,20}$/.test(id)) {
            setSearched({ error: true });
            return;
        }
        setSearched({ guildId: id, shardId: shardForGuild(id, shardCount) });
    };

    const matchedShard = searched?.shardId != null ? shards.find((s) => s.id === searched.shardId) : null;

    return (
        <main className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>{t('status.title')}</h1>
                <p>{t('status.lead')}</p>
            </header>

            <section className={`st-hero is-${overall}`} aria-live="polite">
                <span className="st-hero__icon">
                    <Icon name={overall === 'ok' ? 'check' : overall === 'loading' ? 'refresh' : 'alert'} size={30} strokeWidth={2.5} />
                </span>
                <div className="st-hero__text">
                    <h2>{t(`status.${overall}`)}</h2>
                    <p>
                        {lastChecked ? t('status.checked_at', { time: lastChecked.toLocaleTimeString(locale) }) : t('status.first_check')}
                        {' · '}{t('status.next_in', { s: secondsLeft })}
                    </p>
                </div>
                <button type="button" className="ui-btn" onClick={fetchStatus} disabled={loading}>
                    <Icon name="refresh" size={16} className={loading ? 'ui-spin' : ''} /> {t('common.refresh')}
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
                    <h2>{t('status.clusters')}</h2>
                    <form className="st-search" onSubmit={handleSearch}>
                        <label className="ui-search">
                            <Icon name="search" size={16} />
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder={t('status.guild_id')}
                                value={guildQuery}
                                onChange={(e) => { setGuildQuery(e.target.value); setSearched(null); }}
                                aria-label={t('status.guild_id_label')}
                            />
                        </label>
                        <button type="submit" className="ui-btn ui-btn--primary">{t('status.find')}</button>
                    </form>
                </div>

                {searched?.error ? <div className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {t('status.bad_id')}</div> : null}
                {searched?.guildId ? (
                    <div className={`st-found${matchedShard?.ready === false ? ' is-down' : ''}`}>
                        <Icon name={matchedShard?.ready === false ? 'alert' : 'check'} size={18} />
                        <span>
                            <Trans i18nKey="status.found" values={{ id: searched.guildId, shard: searched.shardId }} components={{ code: <code />, b: <strong /> }} />
                            {matchedShard ? ` — ${matchedShard.ready ? t('status.found_ok') : t('status.found_down')}${matchedShard.ping != null ? ` · ${matchedShard.ping} ms` : ''}` : ''}.
                        </span>
                    </div>
                ) : null}

                <article className="st-cluster">
                    <header>
                        <span className={`st-cluster__dot${discord?.ready ? ' is-on' : ''}`} />
                        <strong>{t('status.cluster', { n: 0 })}</strong>
                        <span className="st-cluster__meta">
                            {t(shardCount > 1 ? 'status.shards_plural' : 'status.shards', { count: shardCount })}
                            {discord ? ` · ${t('status.guilds', { count: discord.guildCount.toLocaleString(locale) })}` : ''}
                        </span>
                    </header>
                    <div className="st-shards">
                        {shards.map((shard) => (
                            <div key={shard.id} className={`st-shard${shard.ready ? ' is-on' : ''}${searched?.shardId === shard.id ? ' is-match' : ''}`}>
                                <span>{t('status.shard', { n: shard.id })}</span>
                                <strong>{shard.ping != null ? `${shard.ping} ms` : '—'}</strong>
                                <i />
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="ui-card st-services">
                <h2>{t('status.services')}</h2>
                <ul>
                    {rows.map((row) => {
                        const state = KNOWN_STATES.includes(row.state) ? row.state : 'unknown';
                        return (
                            <li key={row.name}>
                                <span className="st-services__icon"><Icon name={row.icon} size={18} /></span>
                                <div>
                                    <strong>{row.name}</strong>
                                    <small>{row.desc}</small>
                                </div>
                                <span className={`st-state is-${state}`}>
                                    <i />{t(`status.state_${state}`)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <p className="st-help">
                <Trans i18nKey="status.help" components={{ link: <Link to="/feedback" /> }} />
            </p>
        </main>
    );
}

export default Status;

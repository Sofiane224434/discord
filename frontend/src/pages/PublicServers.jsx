import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { botService } from '../services/api.js';

function PublicServers() {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let active = true;
        botService.getOverview()
            .then((data) => { if (active) setOverview(data); })
            .catch(() => { if (active) setOverview(null); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const guilds = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('fr');
        return (overview?.guilds || []).filter((guild) => !query || String(guild.name || '').toLocaleLowerCase('fr').includes(query));
    }, [overview, search]);
    const stats = overview?.stats || {};

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <p className="site-eyebrow">BOTS / COMMUNAUTÉS</p>
                <h1>Azim, sur les serveurs.</h1>
                <p>Communautés connectées et couverture du bot, à partir des données opérationnelles disponibles.</p>
            </header>

            <section className="public-server-metrics" aria-label="Couverture d’Azim">
                <article><span>Serveurs connectés</span><strong>{loading ? '—' : overview ? Number(stats.guildCount || 0).toLocaleString() : '—'}</strong></article>
                <article><span>Membres couverts</span><strong>{loading ? '—' : overview ? Number(stats.memberCount || 0).toLocaleString() : '—'}</strong></article>
                <article><span>État du bot</span><strong className={overview?.bot?.status === 'online' ? 'public-server-online' : ''}>{loading ? 'Contrôle…' : overview ? (overview.bot?.status === 'online' ? 'En ligne' : 'Hors ligne') : 'Indisponible'}</strong></article>
            </section>

            <div className="public-server-toolbar">
                <label htmlFor="server-search">Communautés</label>
                <input id="server-search" className="form-input" type="search" placeholder="Rechercher un serveur…" value={search} onChange={(event) => setSearch(event.target.value)} />
                <span>{loading ? 'Chargement…' : `${guilds.length} serveur${guilds.length === 1 ? '' : 's'}`}</span>
            </div>

            {loading ? <p className="site-empty-state">Chargement des serveurs connectés…</p> : null}
            {!loading && !overview ? <p className="site-empty-state">L’annuaire n’est pas disponible tant que l’API du bot ne répond pas.</p> : null}
            {!loading && overview && !guilds.length ? <p className="site-empty-state">Aucun serveur ne correspond à cette recherche.</p> : null}
            {guilds.length ? (
                <section className="public-server-list" aria-label="Serveurs équipés d’Azim">
                    {guilds.map((guild) => (
                        <article className="public-server-row" key={guild.id}>
                            {guild.iconUrl ? <img src={guild.iconUrl} alt="" /> : <span className="public-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                            <div><h2>{guild.name}</h2><p>{Number(guild.memberCount || 0).toLocaleString()} membres</p></div>
                            <span className="public-server-tag"><i /> Bot présent</span>
                        </article>
                    ))}
                </section>
            ) : null}

            <section className="module-cta site-panel">
                <div><p className="site-eyebrow">NOUVEAU SERVEUR</p><h2>Installez Azim chez vous.</h2><p>Découvrez les modules et préparez les réglages de votre communauté.</p></div>
                <Link to="/modules" className="btn btn-primary">Découvrir les modules <span aria-hidden="true">→</span></Link>
            </section>
        </main>
    );
}

export default PublicServers;
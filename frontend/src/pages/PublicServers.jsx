import { useEffect, useState } from 'react';
import { systemService } from '../services/api.js';

function PublicServers() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        systemService.getHealth()
            .then((data) => { if (active) setHealth(data); })
            .catch(() => { if (active) setHealth(null); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const services = health?.services || {};

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <p className="site-eyebrow">BOTS</p>
                <h1>Le bot Azim</h1>
                <p>Les commandes d’Azim regroupent l’accueil, les niveaux, les alertes et les outils du serveur.</p>
            </header>

            <section className="public-server-metrics" aria-label="État des services d’Azim">
                <article><span>Bot Discord</span><strong className={services.botApi?.status === 'ok' ? 'public-server-online' : ''}>{loading ? 'Vérification…' : services.botApi?.status === 'ok' ? 'En ligne' : 'Indisponible'}</strong></article>
                <article><span>Panel</span><strong className={services.db?.status === 'ok' ? 'public-server-online' : ''}>{loading ? 'Vérification…' : services.db?.status === 'ok' ? 'En ligne' : 'Indisponible'}</strong></article>
                <article><span>Connexion Discord</span><strong className={services.oauth?.status === 'ok' ? 'public-server-online' : ''}>{loading ? 'Vérification…' : services.oauth?.status === 'ok' ? 'Prête' : 'Indisponible'}</strong></article>
            </section>

            {loading ? <p className="site-empty-state">Chargement de l’état d’Azim…</p> : null}
            {!loading && !health ? <p className="site-empty-state">L’état d’Azim est momentanément indisponible.</p> : null}
            <section className="public-server-list" aria-label="Bot Azim">
                <article className="public-server-row">
                    <img src="/icon.png" alt="" />
                    <div><h2>Azim</h2><p>Accueil des membres, niveaux, commandes et alertes.</p></div>
                    <span className={`public-server-tag ${services.botApi?.status === 'ok' ? 'is-online' : 'is-offline'}`}><i />{loading ? 'Vérification…' : services.botApi?.status === 'ok' ? 'En ligne' : 'Indisponible'}</span>
                </article>
            </section>

            <section className="module-cta site-panel">
                <div><p className="site-eyebrow">AJOUTER AZIM</p><h2>Ajouter le bot à un serveur</h2><p>Après l’installation, choisissez les commandes et salons à utiliser.</p></div>
                <a href="https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands" target="_blank" rel="noreferrer" className="btn btn-primary">Ajouter Azim <span aria-hidden="true">↗</span></a>
            </section>
        </main>
    );
}

export default PublicServers;
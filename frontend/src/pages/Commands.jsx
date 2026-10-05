import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const commandGroups = [
    {
        name: 'Questions & outils',
        commands: [
            ['/ask', 'Pose une question à l’assistant IA du serveur.'],
            ['/help', 'Affiche les commandes actives et leur usage.'],
            ['/ping', 'Mesure la latence Discord et WebSocket.'],
            ['/remindme', 'Programme un rappel personnel dans un délai donné.'],
            ['/salon', 'Propose un nom et une description de salon.'],
            ['/version', 'Affiche la version et l’historique du bot.'],
            ['/serverinfo', 'Consulte les informations et statistiques du serveur.'],
            ['/userinfo', 'Affiche le profil Discord d’un membre.'],
        ],
    },
    {
        name: 'Réglages & accueil',
        commands: [
            ['/config', 'Règle la langue IA, le prompt, les journaux et le profil du bot.'],
            ['/welcome', 'Configure les messages d’arrivée et les règles par rôle.'],
            ['/code', 'Active un module avec son code d’accès.'],
            ['/permissions', 'Consulte les accès requis pour les commandes.'],
        ],
    },
    {
        name: 'Modération & niveaux',
        commands: [
            ['/purge', 'Supprime un ensemble de messages selon des filtres.'],
            ['/zzzz', 'Suspend les réponses automatiques dans un salon.'],
            ['/rank', 'Gère les niveaux, le classement et les récompenses.'],
        ],
    },
    {
        name: 'Alertes & rappels',
        commands: [
            ['/youtube', 'Surveille des chaînes et annonce leurs nouvelles vidéos.'],
            ['/tiktok', 'Configure et contrôle les alertes TikTok Live.'],
            ['/pubtimer', 'Suit le temps consacré aux publications de l’équipe.'],
            ['/rappelbump', 'Envoie le rappel de bump du serveur.'],
        ],
    },
];

function Commands() {
    const { isAuthenticated } = useAuth();
    const [search, setSearch] = useState('');
    const query = search.trim().toLocaleLowerCase('fr');
    const filteredGroups = useMemo(() => commandGroups.map((group) => ({
        ...group,
        commands: group.commands.filter(([name, description]) => `${name} ${description}`.toLocaleLowerCase('fr').includes(query)),
    })).filter((group) => group.commands.length), [query]);
    const commandCount = filteredGroups.reduce((total, group) => total + group.commands.length, 0);

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <p className="site-eyebrow">AIDE · COMMANDES</p>
                <h1>Commandes Azim</h1>
                <p>Retrouvez les commandes du bot et ce qu’elles font. Certaines sont réservées aux admins ou à la modération.</p>
            </header>

            <div className="command-search-row">
                <label className="command-search-label" htmlFor="command-search">Trouver une commande</label>
                <input id="command-search" className="form-input command-search-input" type="search" placeholder="Essayez « langue », « rôle » ou « YouTube »" value={search} onChange={(event) => setSearch(event.target.value)} />
                <span className="command-total">{commandCount} commande{commandCount === 1 ? '' : 's'}</span>
            </div>

            <div className="command-groups">
                {filteredGroups.map((group) => (
                    <section className="command-group" key={group.name}>
                        <h2>{group.name}</h2>
                        <div className="command-list">
                            {group.commands.map(([name, description]) => (
                                <article className="command-row" key={name}>
                                    <code>{name}</code>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
                {!filteredGroups.length ? <p className="site-empty-state">Aucune commande trouvée. Essayez un autre mot.</p> : null}
            </div>

            <aside className="module-cta site-panel">
                <div>
                    <p className="site-eyebrow">VOTRE SERVEUR</p>
                    <h2>Besoin de changer un réglage ?</h2>
                    <p>Connectez-vous avec Discord pour choisir un serveur et modifier ses options.</p>
                </div>
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">Accéder au panel <span aria-hidden="true">→</span></Link>
            </aside>
        </main>
    );
}

export default Commands;
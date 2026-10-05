import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const modules = [
    {
        number: '01',
        title: 'Assistant IA',
        description: 'Réponses en messages et via /ask, avec un prompt, une langue et un nom d’appel configurables pour chaque serveur.',
        commands: ['/ask', '/config ia_langue', '/config ia_prompt'],
        tone: 'cyan',
    },
    {
        number: '02',
        title: 'Accueil des membres',
        description: 'Messages publics ou privés à l’arrivée, avec déclencheurs et règles conditionnelles par rôle.',
        commands: ['/welcome'],
        tone: 'amber',
    },
    {
        number: '03',
        title: 'Progression',
        description: 'XP liée à la participation, profils de niveau, classement et rôles de récompense.',
        commands: ['/rank'],
        tone: 'green',
    },
    {
        number: '04',
        title: 'Modération & contrôle',
        description: 'Nettoyage ciblé des messages, gestion des réponses IA et vérification des permissions.',
        commands: ['/purge', '/zzzz', '/permissions'],
        tone: 'blue',
    },
    {
        number: '05',
        title: 'Veille des réseaux',
        description: 'Surveille les nouvelles vidéos YouTube et les lives TikTok pour publier des alertes dans vos salons.',
        commands: ['/youtube', '/tiktok'],
        tone: 'coral',
    },
    {
        number: '06',
        title: 'Contenu & ressources',
        description: 'Commandes Coran et quiz activables par serveur, complétées par des informations sur les membres et le serveur.',
        commands: ['/coran', '/quiz', '/serverinfo'],
        tone: 'violet',
    },
];

function Modules() {
    const { isAuthenticated } = useAuth();

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <p className="site-eyebrow">MODULES AZIM</p>
                <h1>Les fonctions, serveur par serveur.</h1>
                <p>Activez les outils utiles à votre communauté et gardez les réglages sous la main dans le panel.</p>
            </header>

            <section className="module-grid" aria-label="Modules du bot Azim">
                {modules.map((module) => (
                    <article className={`module-item module-tone-${module.tone}`} key={module.number}>
                        <div className="module-item-head">
                            <span className="module-number">{module.number}</span>
                            <span className="module-command-count">{module.commands.length} {module.commands.length === 1 ? 'commande clé' : 'commandes clés'}</span>
                        </div>
                        <h2>{module.title}</h2>
                        <p>{module.description}</p>
                        <div className="module-command-list">
                            {module.commands.map((command) => <code key={command}>{command}</code>)}
                        </div>
                    </article>
                ))}
            </section>

            <section className="module-cta site-panel">
                <div>
                    <p className="site-eyebrow">CONFIGURATION PAR SERVEUR</p>
                    <h2>Réglez Azim depuis une seule console.</h2>
                    <p>Bienvenue, IA, journaux, notifications et progression restent indépendants d’un serveur à l’autre.</p>
                </div>
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">Ouvrir le panel <span aria-hidden="true">→</span></Link>
            </section>
        </main>
    );
}

export default Modules;
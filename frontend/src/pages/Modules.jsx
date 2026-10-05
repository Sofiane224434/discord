import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const modules = [
    {
        number: '01',
        title: 'Assistant IA',
        description: 'Posez vos questions dans le salon ou avec /ask. Réglez la langue et les consignes pour chaque serveur.',
        commands: ['/ask', '/config ia_langue', '/config ia_prompt'],
        tone: 'cyan',
    },
    {
        number: '02',
        title: 'Accueil des membres',
        description: 'Envoyez un message à l’arrivée, dans un salon ou en privé. Choisissez les règles selon les rôles.',
        commands: ['/welcome'],
        tone: 'amber',
    },
    {
        number: '03',
        title: 'Progression',
        description: 'Faites gagner de l’XP aux membres actifs, affichez le classement et attribuez des rôles par niveau.',
        commands: ['/rank'],
        tone: 'green',
    },
    {
        number: '04',
        title: 'Modération & contrôle',
        description: 'Supprimez des messages, mettez les réponses de l’IA en pause et vérifiez les permissions.',
        commands: ['/purge', '/zzzz', '/permissions'],
        tone: 'blue',
    },
    {
        number: '05',
        title: 'Veille des réseaux',
        description: 'Recevez une annonce quand une chaîne publie une vidéo ou qu’un compte TikTok passe en live.',
        commands: ['/youtube', '/tiktok'],
        tone: 'coral',
    },
    {
        number: '06',
        title: 'Informations & rappels',
        description: 'Consultez les informations du serveur ou d’un membre, et programmez vos rappels.',
        commands: ['/serverinfo', '/userinfo', '/remindme'],
        tone: 'violet',
    },
];

function Modules() {
    const { isAuthenticated } = useAuth();

    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                <p className="site-eyebrow">COMMANDES ET OUTILS</p>
                <h1>Que peut faire Azim ?</h1>
                <p>Choisissez les commandes qui vous servent. Les réglages de chaque serveur se trouvent dans le panel.</p>
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
                    <p className="site-eyebrow">RÉGLAGES</p>
                    <h2>Chaque serveur a ses propres réglages.</h2>
                    <p>Choisissez une langue pour l’IA, un salon de bienvenue ou les alertes qui vous intéressent.</p>
                </div>
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">{isAuthenticated ? 'Ouvrir le panel' : 'Se connecter avec Discord'} <span aria-hidden="true">→</span></Link>
            </section>
        </main>
    );
}

export default Modules;
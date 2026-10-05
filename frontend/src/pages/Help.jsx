import { Link } from 'react-router-dom';

const questions = [
    {
        question: 'Comment configurer Azim sur mon serveur ?',
        answer: 'Connectez-vous avec Discord, ouvrez le panel, puis choisissez un serveur où le bot est présent. Le bouton Configurer le bot donne accès aux réglages propres à ce serveur.',
    },
    {
        question: 'Pourquoi aucun serveur n’apparaît dans le panel ?',
        answer: 'Reconnectez Discord et autorisez la lecture de vos serveurs. Votre compte doit disposer de la permission Gérer le serveur ou Administrateur. Si le bot n’est pas encore invité, le panel vous proposera son ajout.',
    },
    {
        question: 'Comment forcer l’IA à répondre dans une langue ?',
        answer: 'Dans le panel, ouvrez le serveur puis Intelligence artificielle et choisissez la langue des réponses. La même option est disponible avec /config ia_langue langue:français. Laisser le champ vide rétablit le choix contextuel.',
    },
    {
        question: 'Les réglages d’un serveur affectent-ils les autres ?',
        answer: 'Non. Les réglages IA, bienvenue, journaux, profil local, notifications et niveaux sont isolés par serveur. Le nom et l’activité du compte bot restent globaux.',
    },
    {
        question: 'Comment activer /coran et /quiz ?',
        answer: 'Activez le mode Islam dans la configuration du serveur. Azim synchronise ensuite les commandes slash disponibles pour ce serveur.',
    },
    {
        question: 'Où trouver la liste complète des commandes ?',
        answer: 'La documentation présente le catalogue réel d’Azim, organisé par usage et filtrable. Certaines commandes sont limitées à la modération ou aux administrateurs.',
    },
];

function Help() {
    return (
        <main className="site-page site-section-page">
            <header className="site-page-heading">
                 <p className="site-eyebrow">AIDE</p>
                 <h1>Une question sur Azim ?</h1>
                 <p>Voici les réponses aux questions les plus courantes.</p>
            </header>

            <section className="faq-list" aria-label="Questions fréquentes">
                {questions.map((item, index) => (
                    <details className="faq-item" key={item.question} open={index === 0}>
                        <summary><span className="faq-number">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><span className="faq-toggle" aria-hidden="true">+</span></summary>
                        <p>{item.answer}</p>
                    </details>
                ))}
            </section>

            <section className="module-cta site-panel">
                <div>
                    <p className="site-eyebrow">SUPPORT DISCORD</p>
                    <h2>Vous n’avez pas trouvé la réponse ?</h2>
                    <p>Venez poser votre question sur le serveur de support.</p>
                </div>
                <a href="https://discord.gg/xy3NpkjYsF" target="_blank" rel="noreferrer" className="btn btn-primary">Rejoindre le support <span aria-hidden="true">↗</span></a>
            </section>

            <div className="help-quick-links">
                <Link to="/commands">Documentation des commandes <span>→</span></Link>
                <Link to="/status">État des services <span>→</span></Link>
                <Link to="/modules">Découvrir les modules <span>→</span></Link>
            </div>
        </main>
    );
}

export default Help;
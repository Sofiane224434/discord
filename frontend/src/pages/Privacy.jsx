// pages/Privacy.jsx — politique de confidentialité (FR / EN)
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { SUPPORT_URL } from '../config/links.js';

const CONTENT = {
    fr: {
        title: 'Confidentialité',
        lead: 'Ce que le site et le bot AzimBot enregistrent, pourquoi, et comment le supprimer.',
        updated: 'Mise à jour : 15 octobre 2026',
        sections: [
            {
                icon: 'users',
                title: 'Qui gère vos données',
                body: ['AzimBot est un bot Discord gratuit édité par Sofiane Kherarfa (azim404.com). Pour toute question sur vos données, écrivez-nous sur le serveur support.'],
            },
            {
                icon: 'fileText',
                title: 'Données enregistrées',
                list: [
                    'Sur le site : votre compte Discord (identifiant, pseudo, avatar, adresse e-mail si vous la partagez), la liste des serveurs que vous gérez, les réglages que vous enregistrez et les retours que vous envoyez.',
                    'Par le bot : les identifiants Discord des membres, leurs niveaux et points d’expérience, les avertissements de modération, et le nom et l’heure des commandes utilisées.',
                    'Les réglages de chaque serveur faits avec les commandes ou le panel : salons, rôles, messages de bienvenue, consignes de l’IA, comptes YouTube et TikTok suivis.',
                    'Les clés API Groq qu’un serveur ajoute pour son IA : enregistrées chiffrées (AES-256), elles ne sont plus jamais affichées en entier, ni sur le panel ni dans Discord, et chacune peut être supprimée à tout moment.',
                    'Les questions posées avec /ask, le temps de générer la réponse, et les vidéos demandées avec /lecture, le temps de les lire.',
                ],
            },
            {
                icon: 'settings',
                title: 'Pourquoi',
                body: ['Uniquement pour faire fonctionner le bot et le panel : appliquer vos réglages, afficher les statistiques de vos serveurs, protéger les comptes et corriger les erreurs. Aucune donnée n’est vendue ni utilisée pour de la publicité.'],
            },
            {
                icon: 'external',
                title: 'Services tiers',
                list: [
                    'Discord : connexion à votre compte et fonctionnement du bot.',
                    'Groq : reçoit le texte des questions /ask pour générer la réponse.',
                    'L’hébergeur du serveur qui fait tourner le site et le bot.',
                ],
            },
            {
                icon: 'lock',
                title: 'Cookies et stockage local',
                body: [
                    'Le site ne dépose aucun cookie et n’utilise aucun outil de publicité ni de mesure d’audience.',
                    'Votre navigateur garde seulement ce qui est nécessaire : votre session de connexion, la liste de vos serveurs, la langue et le thème choisis. Tout est effacé à la déconnexion ou en vidant les données du site dans votre navigateur.',
                ],
            },
            {
                icon: 'shield',
                title: 'Durée et sécurité',
                body: ['Les données sont gardées tant que votre compte existe ou tant que le bot est sur le serveur concerné. Les échanges passent en HTTPS, les mots de passe sont hachés et les clés API chiffrées. Le panel ne reçoit que les données des serveurs que vous gérez.'],
            },
            {
                icon: 'check',
                title: 'Vos droits',
                body: [
                    'Vous pouvez consulter, corriger ou supprimer vos données.',
                    'Droit à l’oubli : supprimer votre compte (Paramètres) efface immédiatement et définitivement votre compte et les retours envoyés depuis celui-ci.',
                    'Pour effacer les données du bot qui vous concernent (niveaux, avertissements) ou celles d’un serveur que vous gérez (réglages, clés IA), demandez-le sur le serveur support : c’est fait sous un mois. Les clés IA peuvent aussi être supprimées vous-même depuis le panel ou avec /config ia_cle_supprimer.',
                    'Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).',
                ],
            },
        ],
        settings: 'Ouvrir les paramètres',
        support: 'Serveur support',
    },
    en: {
        title: 'Privacy',
        lead: 'What the AzimBot website and bot store, why, and how to delete it.',
        updated: 'Last updated: October 15, 2026',
        sections: [
            {
                icon: 'users',
                title: 'Who handles your data',
                body: ['AzimBot is a free Discord bot published by Sofiane Kherarfa (azim404.com). For any question about your data, write to us on the support server.'],
            },
            {
                icon: 'fileText',
                title: 'Data we store',
                list: [
                    'On the website: your Discord account (ID, username, avatar, email address if you share it), the servers you manage, the settings you save and the feedback you send.',
                    'By the bot: members’ Discord IDs, their levels and experience points, moderation warnings, and the name and time of the commands used.',
                    'Each server’s settings made with commands or the panel: channels, roles, welcome messages, AI instructions, followed YouTube and TikTok accounts.',
                    'Groq API keys a server adds for its AI: stored encrypted (AES-256), they are never shown in full again, neither in the panel nor in Discord, and each one can be removed at any time.',
                    'Questions asked with /ask, while the answer is generated, and videos requested with /play, while they play.',
                ],
            },
            {
                icon: 'settings',
                title: 'Why',
                body: ['Only to run the bot and the panel: apply your settings, show your servers’ statistics, protect accounts and fix errors. No data is sold or used for advertising.'],
            },
            {
                icon: 'external',
                title: 'Third-party services',
                list: [
                    'Discord: signing in to your account and running the bot.',
                    'Groq: receives the text of /ask questions to generate the answer.',
                    'The hosting provider that runs the website and the bot.',
                ],
            },
            {
                icon: 'lock',
                title: 'Cookies and local storage',
                body: [
                    'The website sets no cookies and uses no advertising or analytics tools.',
                    'Your browser only keeps what is needed: your login session, your server list, and your chosen language and theme. Everything is cleared when you log out or clear the site’s data in your browser.',
                ],
            },
            {
                icon: 'shield',
                title: 'Retention and security',
                body: ['Data is kept as long as your account exists, or as long as the bot is on the server concerned. Traffic uses HTTPS, passwords are hashed and API keys encrypted. The panel only receives data for the servers you manage.'],
            },
            {
                icon: 'check',
                title: 'Your rights',
                body: [
                    'You can view, correct or delete your data.',
                    'Right to be forgotten: deleting your account (Settings) immediately and permanently erases your account and the feedback sent from it.',
                    'To erase the bot’s data about you (levels, warnings) or a server you manage (settings, AI keys), ask on the support server: it is done within one month. You can also remove AI keys yourself from the panel or with /config ai_key_remove.',
                    'You can also file a complaint with your data protection authority (CNIL in France).',
                ],
            },
        ],
        settings: 'Open settings',
        support: 'Support server',
    },
};

function Privacy() {
    const { i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);
    const c = CONTENT[lang] || CONTENT.fr;

    return (
        <div className="pg pg--narrow" id="main" tabIndex="-1">
            <header className="pg-head">
                <h1>{c.title}</h1>
                <p>{c.lead}</p>
                <small className="prv-updated">{c.updated}</small>
            </header>

            <div className="prv-grid">
                {c.sections.map((section) => (
                    <section key={section.title} className="ui-card set-section prv-section">
                        <div className="set-section__head">
                            <span className="set-section__icon" style={{ '--c': 'var(--azim-accent)' }}><Icon name={section.icon} size={20} /></span>
                            <div>
                                <h2>{section.title}</h2>
                            </div>
                        </div>
                        {(section.body || []).map((text) => <p key={text}>{text}</p>)}
                        {section.list ? (
                            <ul>
                                {section.list.map((text) => <li key={text}>{text}</li>)}
                            </ul>
                        ) : null}
                    </section>
                ))}
            </div>

            <div className="prv-actions">
                <Link to="/settings" className="ui-btn ui-btn--primary"><Icon name="settings" size={16} /> {c.settings}</Link>
                <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="ui-btn"><Icon name="lifebuoy" size={16} /> {c.support}</a>
            </div>
        </div>
    );
}

export default Privacy;

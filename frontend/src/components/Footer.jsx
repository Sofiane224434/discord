import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from './Icon.jsx';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';
const SUPPORT_URL = 'https://discord.gg/azim';

function Footer() {
    const { i18n } = useTranslation();
    const { theme, isIslamUnlocked } = useTheme();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const columns = [
        {
            title: 'Produit',
            links: [
                { label: 'Fonctionnalités', to: '/#features' },
                { label: 'Commandes', to: '/docs/commandes' },
                { label: 'Documentation', to: '/docs/accueil' },
                { label: 'Statuts', to: '/status' },
                ...(isIslamUnlocked ? [{ label: 'Prières & Coran', to: '/docs/islam-priere' }] : []),
            ],
        },
        {
            title: 'Communauté',
            links: [
                { label: 'Serveur support', href: SUPPORT_URL },
                { label: 'Retours & idées', to: '/feedback' },
                { label: 'Serveurs partenaires', to: '/public-servers' },
                { label: 'Voter sur Top.gg', href: 'https://top.gg' },
            ],
        },
        {
            title: 'Compte',
            links: [
                { label: 'Panel', to: '/dashboard' },
                { label: 'Paramètres', to: '/settings' },
                { label: 'Centre d’aide', to: '/docs/faq' },
            ],
        },
    ];

    return (
        <footer className="ft" role="contentinfo">
            <div className="ft__inner">
                <div className="ft__top">
                    <div className="ft__brand">
                        <Link to="/" className="ft__logo" aria-label="Accueil AzimBot">
                            <img src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'} alt="" />
                            <span>AzimBot</span>
                        </Link>
                        <p>
                            {theme === 'islam'
                                ? 'Le bot Discord français et gratuit : IA, modération, niveaux, prières et radio Coran.'
                                : 'Le bot Discord français et gratuit : IA, modération, niveaux et alertes réseaux.'}
                        </p>
                        <div className="ft__actions">
                            <a href={ADD_BOT_URL} target="_blank" rel="noreferrer" className="ft__btn ft__btn--primary">
                                <Icon name="plus" size={16} /> Ajouter Azim
                            </a>
                            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="ft__btn">
                                <Icon name="lifebuoy" size={16} /> Support
                            </a>
                        </div>
                    </div>

                    {columns.map((col) => (
                        <nav key={col.title} className="ft__col" aria-label={col.title}>
                            <h4>{col.title}</h4>
                            <ul>
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        {link.href ? (
                                            <a href={link.href} target="_blank" rel="noreferrer">
                                                {link.label} <Icon name="external" size={13} />
                                            </a>
                                        ) : (
                                            <Link to={link.to}>{link.label}</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="ft__word" aria-hidden="true">AZIM</div>

                <div className="ft__bottom">
                    <p>
                        © 2024 – {new Date().getFullYear()} AzimBot · Non affilié à Discord Inc.
                    </p>
                    <div className="ft__legal">
                        <Link to="/docs/faq">Confidentialité</Link>
                        <Link to="/docs/faq">Conditions</Link>
                        <Link to="/docs/faq">Mentions légales</Link>
                    </div>
                    <div className="ft__lang" role="group" aria-label="Langue du site">
                        {['fr', 'en'].map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => i18n.changeLanguage(lang)}
                                className={currentLanguage === lang ? 'is-active' : ''}
                                aria-pressed={currentLanguage === lang}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

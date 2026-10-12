import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

function Footer() {
    const { t, i18n } = useTranslation();
    const { theme, isIslamUnlocked } = useTheme();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <footer className="draft-footer" role="contentinfo">
            <div className="draft-footer__accent-bar" aria-hidden="true" />

            <div className="draft-footer__container">
                {/* 4 Colonnes façon DraftBot */}
                <div className="draft-footer__grid">
                    {/* Colonne 1 : Brand & Logo */}
                    <div className="draft-footer__col draft-footer__col--brand">
                        <Link to="/" className="draft-footer__brand-link" aria-label="Accueil AzimBot">
                            <img
                                src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                                alt="AzimBot"
                                className="draft-footer__icon"
                            />
                            <div className="draft-footer__brand-text">
                                <span className="draft-footer__title">AzimBot</span>
                                <span className="draft-footer__badge">v2.4</span>
                            </div>
                        </Link>
                        <p className="draft-footer__description">
                            {theme === 'islam'
                                ? "Le bot Discord tout-en-un d'excellence : intelligence artificielle, modération, spiritualité islamique et personnalisation avancée."
                                : "Le bot Discord nouvelle génération tout-en-un : intelligence artificielle, modération proactive, niveaux et outils de pointe pour votre communauté."
                            }
                        </p>
                        <Link to="/status" className="draft-footer__status-badge">
                            <span className="draft-footer__status-dot" aria-hidden="true" />
                            <span>Tous les systèmes opérationnels</span>
                        </Link>
                    </div>

                    {/* Colonne 2 : Navigation */}
                    <div className="draft-footer__col">
                        <h4 className="draft-footer__heading">Navigation</h4>
                        <ul className="draft-footer__nav-list">
                            <li><Link to="/">Accueil</Link></li>
                            <li><Link to="/docs/accueil">Documentation</Link></li>
                            <li><Link to="/feedback">Retours & Idées</Link></li>
                            <li><Link to="/settings">Paramètres</Link></li>
                            <li><Link to="/dashboard">Panel de gestion</Link></li>
                            <li><Link to="/status">Statut des services</Link></li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Communauté */}
                    <div className="draft-footer__col">
                        <h4 className="draft-footer__heading">Communauté</h4>
                        <ul className="draft-footer__nav-list">
                            <li>
                                <a href="https://discord.gg/azim" target="_blank" rel="noreferrer" className="draft-footer__ext-link">
                                    Support Discord <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                            <li>
                                <a href={ADD_BOT_URL} target="_blank" rel="noreferrer" className="draft-footer__ext-link">
                                    Inviter AzimBot <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                            <li><Link to="/feedback">Signaler un bug & Retours</Link></li>
                            <li><Link to="/public-servers">Serveurs partenaires</Link></li>
                            <li>
                                <a href="https://top.gg" target="_blank" rel="noreferrer" className="draft-footer__ext-link">
                                    Voter sur Top.gg <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Fonctionnalités & Documentation */}
                    <div className="draft-footer__col">
                        <h4 className="draft-footer__heading">Fonctionnalités</h4>
                        <ul className="draft-footer__nav-list">
                            <li><Link to="/docs/ia">Assistant IA & Vision</Link></li>
                            <li><Link to="/docs/moderation">Modération & Automod</Link></li>
                            <li><Link to="/docs/niveaux">Niveaux & Récompenses XP</Link></li>
                            <li><Link to="/docs/bienvenue">Messages de Bienvenue</Link></li>
                            {isIslamUnlocked ? (
                                <li>
                                    <Link to="/docs/islam-priere" className="draft-footer__highlight-link">
                                        🕌 Spiritualité & Prières
                                    </Link>
                                </li>
                            ) : (
                                <li><Link to="/settings">Thèmes & Paramètres</Link></li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="draft-footer__separator" aria-hidden="true" />

                {/* Barre de Liens Légaux façon DraftBot */}
                <div className="draft-footer__legal">
                    <Link to="/help">Centre d'aide</Link>
                    <span className="draft-footer__bullet" aria-hidden="true">•</span>
                    <Link to="/help">Politique de confidentialité</Link>
                    <span className="draft-footer__bullet" aria-hidden="true">•</span>
                    <Link to="/help">Conditions d'utilisation</Link>
                    <span className="draft-footer__bullet" aria-hidden="true">•</span>
                    <Link to="/help">Mentions légales</Link>
                </div>

                {/* Pied inférieur : Copyright & Sélecteur de Langue FR/EN */}
                <div className="draft-footer__bottom">
                    <div className="draft-footer__copyright">
                        <p>
                            Copyright © 2024 - {new Date().getFullYear()} <strong>AzimBot</strong>. Tous droits réservés.
                        </p>
                        <p className="draft-footer__disclaimer">
                            AzimBot n'est ni affilié ni approuvé par Discord Inc.
                        </p>
                    </div>

                    <div className="draft-footer__locales" aria-label="Langue du site">
                        <button
                            type="button"
                            onClick={() => changeLanguage('fr')}
                            className={`draft-footer__locale-btn ${currentLanguage === 'fr' ? 'is-active' : ''}`}
                            aria-pressed={currentLanguage === 'fr'}
                        >
                            FR
                        </button>
                        <span className="draft-footer__locale-sep">/</span>
                        <button
                            type="button"
                            onClick={() => changeLanguage('en')}
                            className={`draft-footer__locale-btn ${currentLanguage === 'en' ? 'is-active' : ''}`}
                            aria-pressed={currentLanguage === 'en'}
                        >
                            EN
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
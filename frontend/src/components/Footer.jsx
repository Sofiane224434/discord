import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from './Icon.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { SUPPORT_URL, ADD_BOT_URL } from '../config/links.js';

function Footer() {
    const { t } = useTranslation();
    const { theme, isIslamUnlocked } = useTheme();

    const columns = [
        {
            title: t('footer.product'),
            links: [
                { label: t('footer.features'), to: '/#features' },
                { label: t('footer.add_azim'), href: ADD_BOT_URL },
                { label: t('footer.commands'), to: '/docs/commandes' },
                { label: t('footer.docs'), to: '/docs/accueil' },
                { label: t('footer.status'), to: '/status' },
                ...(isIslamUnlocked ? [{ label: t('footer.prayers'), to: '/docs/islam-priere' }] : []),
            ],
        },
        {
            title: t('footer.community'),
            links: [
                { label: t('footer.support_server'), href: SUPPORT_URL },
                { label: t('footer.feedback'), to: '/feedback' },
                { label: t('footer.partners'), to: '/public-servers' },
                { label: t('footer.vote'), href: 'https://top.gg' },
            ],
        },
        {
            title: t('footer.account'),
            links: [
                { label: t('footer.panel'), to: '/dashboard' },
                { label: t('footer.settings'), to: '/settings' },
                { label: t('footer.help'), to: '/docs/faq' },
            ],
        },
    ];

    return (
        <footer className="ft" role="contentinfo">
            <div className="ft__inner">
                <div className="ft__top">
                    <div className="ft__brand">
                        <Link to="/" className="ft__logo" aria-label={t('header.home_label')}>
                            <img src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'} alt="" className="ft__icon" />
                            {/* Même logo texte que l'en-tête */}
                            <img src={theme === 'islam' ? '/logo-islam.png' : '/logo.png'} alt="AzimBot" className="ft__wordmark" />
                        </Link>
                        <p>{theme === 'islam' ? t('footer.tagline_islam') : t('footer.tagline')}</p>
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
                    <p>{t('footer.legal', { year: new Date().getFullYear() })}</p>
                    <LanguageSwitch />
                </div>
            </div>
        </footer>
    );
}

export default Footer;

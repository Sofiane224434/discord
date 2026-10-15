import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from './Icon.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { SUPPORT_URL, openAddBot } from '../config/links.js';

function Footer() {
    const { t } = useTranslation();
    const { theme, isIslamUnlocked } = useTheme();

    const columns = [
        {
            title: t('footer.product'),
            links: [
                { label: t('footer.features'), to: '/#features' },
                { label: t('footer.add_azim'), onClick: openAddBot },
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
                { label: t('footer.privacy'), to: '/confidentialite' },
                { label: t('footer.terms'), to: '/cgu' },
                { label: t('footer.legal_notice'), to: '/mentions-legales' },
            ],
        },
    ];

    return (
        <footer className="ft" role="contentinfo">
            <div className="ft__inner">
                <div className="ft__top">
                    <div className="ft__brand">
                        <Link to="/" className="ft__logo" aria-label={t('header.home_label')}>
                            <img src={theme === 'islam' ? '/icon-islam.webp' : '/icon.webp'} alt="" width="46" height="46" loading="lazy" className="ft__icon" />
                            {/* Même logo texte que l'en-tête */}
                            <img src={theme === 'islam' ? '/logo-islam.webp' : '/logo.webp'} alt="AzimBot" width="177" height="34" loading="lazy" className="ft__wordmark" />
                        </Link>
                        <p>{theme === 'islam' ? t('footer.tagline_islam') : t('footer.tagline')}</p>
                    </div>

                    {columns.map((col) => (
                        <nav key={col.title} className="ft__col" aria-label={col.title}>
                            <h2 className="ft__col-title">{col.title}</h2>
                            <ul>
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        {link.onClick ? (
                                            <button type="button" className="ft__linkbtn" onClick={link.onClick}>
                                                {link.label} <Icon name="external" size={13} />
                                            </button>
                                        ) : link.href ? (
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

                {/* Le domaine du site, en grand */}
                <a href="https://azim404.com" className="ft__word" target="_blank" rel="noreferrer" aria-label="azim404.com">AZIM404.COM</a>

                <div className="ft__bottom">
                    <p>{t('footer.legal', { year: new Date().getFullYear() })}</p>
                    <LanguageSwitch />
                </div>
            </div>
        </footer>
    );
}

export default Footer;

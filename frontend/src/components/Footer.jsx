// components/Footer.jsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-brand">
                    <img src="/icon.png" alt="" />
                    <span>AZIM<span className="site-brand-dot">.</span></span>
                    <small>Console de pilotage Discord</small>
                </div>
                <nav className="site-footer-links" aria-label="Liens du site">
                    <Link to="/modules">Modules</Link>
                    <Link to="/commands">Documentation</Link>
                    <Link to="/status">Statut</Link>
                    <Link to="/help">Support</Link>
                    <Link to="/dashboard">Panel</Link>
                </nav>
                <p className="site-footer-copy">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </div>
        </footer>
    );
}
export default Footer;
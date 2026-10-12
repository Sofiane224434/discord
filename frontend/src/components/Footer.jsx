// components/Footer.jsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-brand flex items-center gap-2">
                    <img src="/icon.png" alt="" className="size-8 object-contain" />
                    <img src="/logo.png" alt="AzimBot" className="h-6 w-auto object-contain" />
                    <small>Bot Discord et commandes</small>
                </div>
                <nav className="site-footer-links" aria-label="Liens du site">
                    <Link to="/modules">Modules</Link>
                    <Link to="/commands">Commandes</Link>
                    <Link to="/status">Statut</Link>
                    <Link to="/help">Aide</Link>
                    <Link to="/dashboard">Panel</Link>
                </nav>
                <p className="site-footer-copy">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </div>
        </footer>
    );
}
export default Footer;
// components/Footer.jsx
import { useTranslation } from 'react-i18next';
function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-slate-950 text-slate-200 py-6 mt-auto border-t border-white/10">
            <div className="container mx-auto px-4 text-center space-y-1">
                <p className="text-sm font-semibold tracking-wide">Azim Control Center</p>
                <p className="text-xs text-slate-400">
                    {t('footer.copyright', { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
}
export default Footer;
// pages/NotFound.jsx — adresse inconnue (404), dans le style du site
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon.jsx';

function NotFound() {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    return (
        <section className="nf" aria-labelledby="nf-title">
            <p className="nf__code" aria-hidden="true">404</p>
            <h1 id="nf-title">{t('notfound.title')}</h1>
            <p className="nf__text">{t('notfound.text')}</p>
            <code className="nf__path">{pathname}</code>
            <div className="nf__actions">
                <Link to="/" className="ui-btn ui-btn--primary"><Icon name="arrowLeft" size={16} /> {t('notfound.home')}</Link>
                <Link to="/docs" className="ui-btn"><Icon name="book" size={16} /> {t('notfound.docs')}</Link>
            </div>
        </section>
    );
}

export default NotFound;

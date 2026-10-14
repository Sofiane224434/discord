import { useTranslation } from 'react-i18next';
import EmailComposer from '../components/EmailComposer.jsx';

function EmailPage() {
    const { t } = useTranslation();

    return (
        <div className="site-page site-section-page email-page">
            <div className="email-page-heading">
                    <h1>{t('email.title')}</h1>
                    <p>{t('email.subtitle')}</p>
                </div>
                <EmailComposer />
        </div>
    );
}

export default EmailPage;
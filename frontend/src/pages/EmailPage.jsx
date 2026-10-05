import { useTranslation } from 'react-i18next';
import EmailComposer from '../components/EmailComposer.jsx';

function EmailPage() {
    const { t } = useTranslation();

    return (
        <main className="site-page site-section-page email-page">
            <div className="email-page-heading">
                    <h1>{t('email.title')}</h1>
                    <p>{t('email.subtitle')}</p>
                </div>
                <EmailComposer />
        </main>
    );
}

export default EmailPage;
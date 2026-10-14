// components/PrivacyNotice.jsx — bandeau d'information sur le stockage (aucun cookie), affiché une fois
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const KEY = 'azim_privacy_notice';

function readSeen() {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

function PrivacyNotice() {
    const { t } = useTranslation();
    const [seen, setSeen] = useState(readSeen);

    if (seen) return null;

    const close = () => {
        try { localStorage.setItem(KEY, '1'); } catch { /* navigation privée */ }
        setSeen(true);
    };

    return (
        <div id="cookie-banner" className="cookie-consent prv-notice" role="region" aria-label={t('privacy.notice_label')}>
            <p>
                {t('privacy.notice')} <Link to="/confidentialite" onClick={close}>{t('privacy.notice_link')}</Link>
            </p>
            <button type="button" className="ui-btn ui-btn--primary" onClick={close}>{t('privacy.notice_ok')}</button>
        </div>
    );
}

export default PrivacyNotice;

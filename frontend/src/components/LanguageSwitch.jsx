// components/LanguageSwitch.jsx — sélecteur FR / EN (i18next mémorise le choix dans le navigateur)
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { id: 'fr', short: 'FR', label: 'Français' },
    { id: 'en', short: 'EN', label: 'English' },
];

function LanguageSwitch({ variant = 'short', className = '' }) {
    const { i18n, t } = useTranslation();
    const current = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    return (
        <div className={`ui-seg lang-switch lang-switch--${variant} ${className}`} role="radiogroup" aria-label={t('common.language')}>
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.id}
                    type="button"
                    role="radio"
                    aria-checked={current === lang.id}
                    className={current === lang.id ? 'is-active' : ''}
                    onClick={() => i18n.changeLanguage(lang.id)}
                    lang={lang.id}
                >
                    {variant === 'long' ? lang.label : lang.short}
                </button>
            ))}
        </div>
    );
}

export default LanguageSwitch;

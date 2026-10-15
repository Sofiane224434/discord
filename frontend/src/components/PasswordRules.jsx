// components/PasswordRules.jsx — critères du mot de passe, cochés au fur et à mesure de la saisie
import { useTranslation } from 'react-i18next';
import Icon from './Icon.jsx';
import { PASSWORD_RULES, PASSWORD_MIN_LENGTH } from '../utils/passwordPolicy.js';

function PasswordRules({ password }) {
    const { t } = useTranslation();
    const value = String(password || '');
    return (
        <ul className="pw-rules" aria-label={t('password.rules_label')}>
            {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(value);
                return (
                    <li key={rule.id} className={ok ? 'is-ok' : ''}>
                        <Icon name={ok ? 'check' : 'close'} size={14} />
                        {t(`password.rule_${rule.id}`, { n: PASSWORD_MIN_LENGTH })}
                    </li>
                );
            })}
        </ul>
    );
}

export default PasswordRules;

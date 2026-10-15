// components/ForcePasswordChange.jsx — un mot de passe trop faible doit être remplacé avant d'utiliser le site
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/api.js';
import { isStrongPassword } from '../utils/passwordPolicy.js';
import PasswordRules from './PasswordRules.jsx';
import Icon from './Icon.jsx';

function ForcePasswordChange() {
    const { t } = useTranslation();
    const { refreshUser, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError(t('account.mismatch'));
        setBusy(true);
        setError('');
        try {
            await authService.changePassword({ currentPassword, newPassword });
            await refreshUser();
        } catch (err) {
            setError(err?.message || t('common.unknown_error'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="pg pg--narrow pw-force">
            <header className="pg-head">
                <h1>{t('password.force_title')}</h1>
                <p>{t('password.force_lead')}</p>
            </header>
            <form className="ui-card pw-force__card" onSubmit={submit}>
                <label className="ui-field">
                    <span className="ui-field__label">{t('account.current_password')}</span>
                    <input type="password" className="ui-input" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </label>
                <label className="ui-field">
                    <span className="ui-field__label">{t('account.new_password')}</span>
                    <input type="password" className="ui-input" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </label>
                <PasswordRules password={newPassword} />
                <label className="ui-field">
                    <span className="ui-field__label">{t('account.confirm')}</span>
                    <input type="password" className="ui-input" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </label>
                {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                <div className="acc-form__actions">
                    <button type="button" className="ui-btn ui-btn--ghost" onClick={logout}><Icon name="logout" size={16} /> {t('header.logout')}</button>
                    <button type="submit" className="ui-btn ui-btn--primary" disabled={busy || !isStrongPassword(newPassword)}>
                        {busy ? t('common.saving') : t('password.force_submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ForcePasswordChange;

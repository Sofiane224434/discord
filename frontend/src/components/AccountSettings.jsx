// components/AccountSettings.jsx — profil, email, mot de passe et suppression du compte
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { authService, startDiscordLogin } from '../services/api.js';
import Icon from './Icon.jsx';
import PasswordRules from './PasswordRules.jsx';
import { isStrongPassword } from '../utils/passwordPolicy.js';

// Champ « mot de passe actuel », affiché seulement quand il est exigé
function CurrentPasswordField({ value, onChange, withDiscord }) {
    const { t } = useTranslation();
    return (
        <label className="ui-field">
            <span className="ui-field__label">{t('account.current_password')}</span>
            <input type="password" className="ui-input" autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} required />
            {withDiscord ? (
                <span className="cf-hint">
                    {t('account.forgot')}{' '}
                    <button type="button" className="acc-link" onClick={() => startDiscordLogin('/settings')}>{t('account.reauth_link')}</button>
                    {' '}{t('account.forgot_end')}
                </span>
            ) : null}
        </label>
    );
}

// Message + bouton quand l'action exige une reconnexion Discord
function ReauthNotice() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    return (
        <div className="acc-reauth">
            <Icon name="key" size={18} />
            <span>{t('account.reauth_text')}</span>
            <button type="button" className="ui-btn" onClick={() => startDiscordLogin('/settings').catch(() => setError(t('account.reauth_error')))}>
                {t('account.reauth_btn')}
            </button>
            {error ? <small>{error}</small> : null}
        </div>
    );
}

function AccountSettings() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [editing, setEditing] = useState(null); // 'email' | 'password' | null
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [needsReauth, setNeedsReauth] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    // Mot de passe actuel exigé, sauf juste après une connexion Discord
    const needsPassword = Boolean(user.hasPassword && !user.recentDiscordAuth);
    // Compte sans mot de passe et connexion Discord trop ancienne : il faut se reconnecter
    const mustReauth = needsReauth || (!user.hasPassword && !user.recentDiscordAuth);
    const displayName = user.username || user.firstname || t('account.user');

    const resetForms = () => {
        setEditing(null);
        setEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    const open = (section) => {
        resetForms();
        setNotice('');
        setEditing(section);
        if (section === 'email') setEmail(user.email || '');
    };

    const handleError = (err) => {
        if (err?.code === 'REAUTH_DISCORD') setNeedsReauth(true);
        setError(err?.message || t('common.unknown_error'));
    };

    const submitEmail = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await authService.changeEmail({ email: email.trim(), currentPassword: needsPassword ? currentPassword : undefined });
            await refreshUser();
            resetForms();
            setNotice(t('account.email_saved'));
        } catch (err) {
            handleError(err);
        } finally {
            setBusy(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t('account.mismatch'));
            return;
        }
        setBusy(true);
        setError('');
        try {
            await authService.changePassword({ newPassword, currentPassword: needsPassword ? currentPassword : undefined });
            await refreshUser();
            resetForms();
            setNotice(t('account.password_saved'));
        } catch (err) {
            handleError(err);
        } finally {
            setBusy(false);
        }
    };

    const submitDelete = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await authService.deleteAccount({ confirm: deleteConfirm.trim(), currentPassword: needsPassword ? currentPassword : undefined });
            logout();
            navigate('/', { replace: true });
        } catch (err) {
            handleError(err);
        } finally {
            setBusy(false);
        }
    };

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.resolvedLanguage || 'fr', { month: 'long', year: 'numeric' }) : null;

    return (
        <>
            {/* Profil */}
            <section className="ui-card set-section">
                <div className="acc-profile">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="acc-profile__avatar" />
                    ) : (
                        <span className="acc-profile__avatar acc-profile__avatar--fallback">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                    <div>
                        <h2>{displayName}</h2>
                        <p>
                            {user.hasDiscord ? t('account.discord_account') : t('account.email_account')}
                            {memberSince ? ` · ${t('account.member_since', { date: memberSince })}` : ''}
                        </p>
                    </div>
                </div>
            </section>

            {/* Connexion & sécurité */}
            <section className="ui-card set-section">
                <div className="set-section__head">
                    <span className="set-section__icon" style={{ '--c': 'var(--azim-accent)' }}><Icon name="shield" size={20} /></span>
                    <div>
                        <h2>{t('account.security')}</h2>
                        <p>{t('account.security_lead')}</p>
                    </div>
                </div>

                {notice ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {notice}</div> : null}

                <div className="acc-rows">
                    {/* Email */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>{t('account.email')}</strong>
                            <small>{user.email || t('account.no_email')}</small>
                        </div>
                        {editing !== 'email' ? (
                            <button type="button" className="ui-btn" onClick={() => open('email')}>{user.email ? t('account.edit') : t('common.add')}</button>
                        ) : null}
                        {editing === 'email' ? (
                            <form className="acc-form" onSubmit={submitEmail}>
                                {mustReauth ? <ReauthNotice /> : null}
                                <label className="ui-field">
                                    <span className="ui-field__label">{t('account.new_email')}</span>
                                    <input type="email" className="ui-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </label>
                                {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                                {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                                <div className="acc-form__actions">
                                    <button type="button" className="ui-btn ui-btn--ghost" onClick={resetForms}>{t('common.cancel')}</button>
                                    <button type="submit" className="ui-btn ui-btn--primary" disabled={busy || mustReauth || !email.trim()}>{busy ? t('common.saving') : t('common.save')}</button>
                                </div>
                            </form>
                        ) : null}
                    </div>

                    {/* Mot de passe */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>{t('account.password')}</strong>
                            <small>
                                {user.hasPassword ? t('account.password_set') : t('account.password_unset')}
                            </small>
                        </div>
                        {editing !== 'password' ? (
                            <button type="button" className="ui-btn" onClick={() => open('password')}>{user.hasPassword ? t('account.change') : t('account.set')}</button>
                        ) : null}
                        {editing === 'password' ? (
                            <form className="acc-form" onSubmit={submitPassword}>
                                {mustReauth ? <ReauthNotice /> : null}
                                {!user.email && !user.hasPassword ? (
                                    <p className="acc-hint">{t('account.add_email_hint')}</p>
                                ) : null}
                                {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                                <div className="acc-form__grid">
                                    <label className="ui-field">
                                        <span className="ui-field__label">{t('account.new_password')}</span>
                                        <input type="password" className="ui-input" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                        <PasswordRules password={newPassword} />
                                    </label>
                                    <label className="ui-field">
                                        <span className="ui-field__label">{t('account.confirm')}</span>
                                        <input type="password" className="ui-input" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </label>
                                </div>
                                {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                                <div className="acc-form__actions">
                                    <button type="button" className="ui-btn ui-btn--ghost" onClick={resetForms}>{t('common.cancel')}</button>
                                    <button type="submit" className="ui-btn ui-btn--primary" disabled={busy || mustReauth || !isStrongPassword(newPassword)}>
                                        {busy ? t('common.saving') : t('common.save')}
                                    </button>
                                </div>
                            </form>
                        ) : null}
                    </div>

                    {/* Discord */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>{t('account.discord')}</strong>
                            <small>{user.hasDiscord ? t('account.discord_linked', { name: displayName }) : t('account.discord_unlinked')}</small>
                        </div>
                        <button type="button" className="ui-btn ui-btn--ghost" onClick={logout}>
                            <Icon name="logout" size={16} /> {t('header.logout')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Zone de danger */}
            <section className="ui-card set-section acc-danger">
                <div className="acc-row">
                    <div className="acc-row__info">
                        <strong>{t('account.delete')}</strong>
                        <small>{t('account.delete_lead')}</small>
                    </div>
                    <button type="button" className="ui-btn ui-btn--danger" onClick={() => { resetForms(); setDeleteConfirm(''); setDeleteOpen(true); }}>
                        {t('account.delete_btn')}
                    </button>
                </div>
            </section>

            {deleteOpen ? (
                <div className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="acc-delete-title" onClick={() => setDeleteOpen(false)}>
                    <section className="ui-modal__panel" onClick={(e) => e.stopPropagation()}>
                        <header className="ui-modal__head">
                            <h2 id="acc-delete-title">{t('account.delete_title')}</h2>
                            <button type="button" className="ui-icon-btn" onClick={() => setDeleteOpen(false)} aria-label={t('common.close')}><Icon name="close" size={18} /></button>
                        </header>
                        <form className="fb-form__body" onSubmit={submitDelete}>
                            <p className="acc-hint">{t('account.delete_warning')}</p>
                            {mustReauth ? <ReauthNotice /> : null}
                            {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                            <label className="ui-field">
                                <span className="ui-field__label">{t('account.delete_confirm', { word: t('account.delete_word') })}</span>
                                <input type="text" className="ui-input" autoComplete="off" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
                            </label>
                            {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                            <footer className="ui-modal__foot">
                                <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setDeleteOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="ui-btn ui-btn--danger-solid" disabled={busy || mustReauth || deleteConfirm.trim() !== t('account.delete_word')}>
                                    {busy ? t('account.deleting') : t('account.delete_final')}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            ) : null}
        </>
    );
}

export default AccountSettings;

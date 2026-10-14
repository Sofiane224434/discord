// components/AccountSettings.jsx — profil, email, mot de passe et suppression du compte
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { authService, startDiscordLogin } from '../services/api.js';
import Icon from './Icon.jsx';

const MIN_PASSWORD_LENGTH = 8;

// Champ « mot de passe actuel », affiché seulement quand il est exigé
function CurrentPasswordField({ value, onChange, withDiscord }) {
    return (
        <label className="ui-field">
            <span className="ui-field__label">Mot de passe actuel</span>
            <input type="password" className="ui-input" autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} required />
            {withDiscord ? (
                <span className="cf-hint">
                    Oublié ou jamais défini ?{' '}
                    <button type="button" className="acc-link" onClick={() => startDiscordLogin('/settings')}>Reconnectez-vous avec Discord</button>
                    {' '}pour confirmer sans lui.
                </span>
            ) : null}
        </label>
    );
}

// Message + bouton quand l'action exige une reconnexion Discord
function ReauthNotice() {
    const [error, setError] = useState('');
    return (
        <div className="acc-reauth">
            <Icon name="key" size={18} />
            <span>Votre compte n’a pas de mot de passe : reconnectez-vous avec Discord pour confirmer qu’il s’agit bien de vous.</span>
            <button type="button" className="ui-btn" onClick={() => startDiscordLogin('/settings').catch(() => setError('Connexion Discord indisponible.'))}>
                Se reconnecter
            </button>
            {error ? <small>{error}</small> : null}
        </div>
    );
}

function AccountSettings() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

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
    const displayName = user.username || user.firstname || 'Utilisateur';

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
        setError(err?.message || 'Une erreur est survenue.');
    };

    const submitEmail = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const res = await authService.changeEmail({ email: email.trim(), currentPassword: needsPassword ? currentPassword : undefined });
            await refreshUser();
            resetForms();
            setNotice(res.message || 'Adresse email mise à jour.');
        } catch (err) {
            handleError(err);
        } finally {
            setBusy(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Les deux mots de passe ne correspondent pas.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const res = await authService.changePassword({ newPassword, currentPassword: needsPassword ? currentPassword : undefined });
            await refreshUser();
            resetForms();
            setNotice(res.message || 'Mot de passe enregistré.');
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

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null;

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
                            {user.hasDiscord ? 'Compte lié à Discord' : 'Compte email'}
                            {memberSince ? ` · membre depuis ${memberSince}` : ''}
                        </p>
                    </div>
                </div>
            </section>

            {/* Connexion & sécurité */}
            <section className="ui-card set-section">
                <div className="set-section__head">
                    <span className="set-section__icon" style={{ '--c': 'var(--azim-accent)' }}><Icon name="shield" size={20} /></span>
                    <div>
                        <h2>Connexion & sécurité</h2>
                        <p>Votre adresse email et vos moyens de connexion.</p>
                    </div>
                </div>

                {notice ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {notice}</div> : null}

                <div className="acc-rows">
                    {/* Email */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>Adresse email</strong>
                            <small>{user.email || 'Aucune adresse : votre compte Discord ne l’a pas partagée.'}</small>
                        </div>
                        {editing !== 'email' ? (
                            <button type="button" className="ui-btn" onClick={() => open('email')}>{user.email ? 'Modifier' : 'Ajouter'}</button>
                        ) : null}
                        {editing === 'email' ? (
                            <form className="acc-form" onSubmit={submitEmail}>
                                {mustReauth ? <ReauthNotice /> : null}
                                <label className="ui-field">
                                    <span className="ui-field__label">Nouvelle adresse</span>
                                    <input type="email" className="ui-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </label>
                                {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                                {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                                <div className="acc-form__actions">
                                    <button type="button" className="ui-btn ui-btn--ghost" onClick={resetForms}>Annuler</button>
                                    <button type="submit" className="ui-btn ui-btn--primary" disabled={busy || mustReauth || !email.trim()}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
                                </div>
                            </form>
                        ) : null}
                    </div>

                    {/* Mot de passe */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>Mot de passe</strong>
                            <small>
                                {user.hasPassword
                                    ? 'Défini : vous pouvez vous connecter avec votre email.'
                                    : 'Pas encore défini : vous vous connectez uniquement avec Discord.'}
                            </small>
                        </div>
                        {editing !== 'password' ? (
                            <button type="button" className="ui-btn" onClick={() => open('password')}>{user.hasPassword ? 'Changer' : 'Définir'}</button>
                        ) : null}
                        {editing === 'password' ? (
                            <form className="acc-form" onSubmit={submitPassword}>
                                {mustReauth ? <ReauthNotice /> : null}
                                {!user.email && !user.hasPassword ? (
                                    <p className="acc-hint">Ajoutez aussi une adresse email pour pouvoir vous connecter sans Discord.</p>
                                ) : null}
                                {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                                <div className="acc-form__grid">
                                    <label className="ui-field">
                                        <span className="ui-field__label">Nouveau mot de passe <em>{MIN_PASSWORD_LENGTH} caractères minimum</em></span>
                                        <input type="password" className="ui-input" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    </label>
                                    <label className="ui-field">
                                        <span className="ui-field__label">Confirmer</span>
                                        <input type="password" className="ui-input" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </label>
                                </div>
                                {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                                <div className="acc-form__actions">
                                    <button type="button" className="ui-btn ui-btn--ghost" onClick={resetForms}>Annuler</button>
                                    <button type="submit" className="ui-btn ui-btn--primary" disabled={busy || mustReauth || newPassword.length < MIN_PASSWORD_LENGTH}>
                                        {busy ? 'Enregistrement…' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        ) : null}
                    </div>

                    {/* Discord */}
                    <div className="acc-row">
                        <div className="acc-row__info">
                            <strong>Discord</strong>
                            <small>{user.hasDiscord ? `Lié au compte ${displayName}` : 'Non lié : connectez-vous une fois avec Discord pour gérer vos serveurs.'}</small>
                        </div>
                        <button type="button" className="ui-btn ui-btn--ghost" onClick={logout}>
                            <Icon name="logout" size={16} /> Déconnexion
                        </button>
                    </div>
                </div>
            </section>

            {/* Zone de danger */}
            <section className="ui-card set-section acc-danger">
                <div className="acc-row">
                    <div className="acc-row__info">
                        <strong>Supprimer mon compte</strong>
                        <small>Votre compte du site est supprimé définitivement. Azim reste sur vos serveurs et leurs réglages sont conservés.</small>
                    </div>
                    <button type="button" className="ui-btn ui-btn--danger" onClick={() => { resetForms(); setDeleteConfirm(''); setDeleteOpen(true); }}>
                        Supprimer…
                    </button>
                </div>
            </section>

            {deleteOpen ? (
                <div className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="acc-delete-title" onClick={() => setDeleteOpen(false)}>
                    <section className="ui-modal__panel" onClick={(e) => e.stopPropagation()}>
                        <header className="ui-modal__head">
                            <h2 id="acc-delete-title">Supprimer le compte ?</h2>
                            <button type="button" className="ui-icon-btn" onClick={() => setDeleteOpen(false)} aria-label="Fermer"><Icon name="close" size={18} /></button>
                        </header>
                        <form className="fb-form__body" onSubmit={submitDelete}>
                            <p className="acc-hint">Cette action est définitive. Vous pourrez toujours recréer un compte en vous reconnectant avec Discord.</p>
                            {mustReauth ? <ReauthNotice /> : null}
                            {needsPassword ? <CurrentPasswordField value={currentPassword} onChange={setCurrentPassword} withDiscord={user.hasDiscord} /> : null}
                            <label className="ui-field">
                                <span className="ui-field__label">Tapez SUPPRIMER pour confirmer</span>
                                <input type="text" className="ui-input" autoComplete="off" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
                            </label>
                            {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
                            <footer className="ui-modal__foot">
                                <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setDeleteOpen(false)}>Annuler</button>
                                <button type="submit" className="ui-btn ui-btn--danger-solid" disabled={busy || mustReauth || deleteConfirm.trim() !== 'SUPPRIMER'}>
                                    {busy ? 'Suppression…' : 'Supprimer définitivement'}
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

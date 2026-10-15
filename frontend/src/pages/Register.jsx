// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import PasswordRules from '../components/PasswordRules.jsx';
import { isStrongPassword } from '../utils/passwordPolicy.js';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('errors.passwords_mismatch'));
            return;
        }
        if (!isStrongPassword(formData.password)) {
            setError(t('password.too_weak'));
            return;
        }
        if (!formData.acceptTerms) {
            setError(t('register.terms_required'));
            return;
        }

        setLoading(true);
        try {
            await register({
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || t('errors.register_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="auth-card w-full max-w-md">
                <h1 className="text-2xl font-bold mb-2 text-center">{t('register.title')}</h1>
                <p className="auth-card-note text-sm text-center mb-6">{t('register.lead')}</p>

                {error && <p className="text-rose-700 text-sm mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="auth-card-label block text-sm font-medium mb-1">{t('register.email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="form-input disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="auth-card-label block text-sm font-medium mb-1">{t('register.password')}</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            className="form-input disabled:bg-gray-100"
                        />
                        <PasswordRules password={formData.password} />
                    </div>
                    <div>
                        <label className="auth-card-label block text-sm font-medium mb-1">{t('register.confirm_password')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="form-input disabled:bg-gray-100"
                        />
                    </div>
                    {/* Acceptation des CGU et de la politique de confidentialité, obligatoire */}
                    <label className="reg-terms">
                        <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
                        <span>
                            {t('register.terms_before')} <Link to="/cgu" target="_blank" className="auth-card-link">{t('register.terms_link')}</Link> {t('register.terms_and')} <Link to="/confidentialite" target="_blank" className="auth-card-link">{t('register.privacy_link')}</Link>.
                        </span>
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary disabled:opacity-60"
                    >
                        {loading ? t('register.loading') : t('register.submit')}
                    </button>
                </form>

                <p className="auth-card-note text-center text-sm mt-6">
                    {t('register.already_account')} <Link to="/login" className="auth-card-link font-medium">{t('register.login_link')}</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
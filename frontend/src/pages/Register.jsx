// pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('errors.passwords_mismatch'));
            return;
        }
        if (formData.password.length < 6) {
            setError(t('errors.password_too_short'));
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
                <p className="auth-card-note text-sm text-center mb-6">Créez un accès au site. Connectez ensuite Discord pour retrouver vos serveurs.</p>

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
                            className="form-input disabled:bg-gray-100"
                        />
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
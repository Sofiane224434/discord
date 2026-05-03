// pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../hooks/useAuth.js";
import { discordService } from '../services/api.js';

function formatApiError(err, fallback) {
    if (!err) return fallback;
    if (err.hint) {
        return `${err.message || fallback} - ${err.hint}`;
    }
    return err.message || fallback;
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(formatApiError(err, t('errors.login_error')));
        } finally {
            setLoading(false);
        }
    };

    const handleDiscordLogin = async () => {
        setError('');
        try {
            const redirectUri = `${window.location.origin}/oauth/discord/callback`;
            const data = await discordService.getAuthUrl(redirectUri);
            sessionStorage.setItem('discord_oauth_redirect_uri', data.redirectUri || redirectUri);
            window.location.href = data.url;
        } catch (err) {
            setError(formatApiError(err, t('oauth.error_exchange')));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="bg-white/90 border border-white shadow-xl p-8 rounded-2xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-2 text-center">{t('login.title')}</h1>
                <p className="text-sm text-slate-500 text-center mb-6 mono">AZIM-CONTROL/ACCESS</p>

                {error && <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">{t('login.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">{t('login.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary disabled:opacity-60"
                    >
                        {loading ? t('login.loading') : t('login.submit')}
                    </button>
                </form>

                <div className="my-4 flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs text-slate-500 mono">OR</span>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                <button
                    type="button"
                    onClick={handleDiscordLogin}
                    className="w-full btn btn-soft"
                >
                    {t('login.discord_button')}
                </button>

                <p className="text-center mt-4 text-sm text-slate-600">
                    {t('login.no_account')} <Link to="/register" className="text-teal-700 hover:underline">{t('login.register_link')}</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;

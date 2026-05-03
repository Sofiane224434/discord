import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { discordService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

function formatApiError(err, fallback) {
    if (!err) return fallback;
    if (err.hint) {
        return `${err.message || fallback} - ${err.hint}`;
    }
    return err.message || fallback;
}

function DiscordCallback() {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setSession } = useAuth();

    useEffect(() => {
        let mounted = true;

        async function handleOAuth() {
            const code = searchParams.get('code');

            if (!code) {
                if (mounted) {
                    setError(t('oauth.error_no_code'));
                    setLoading(false);
                }
                return;
            }

            try {
                const redirectUri =
                    sessionStorage.getItem('discord_oauth_redirect_uri') ||
                    `${window.location.origin}/oauth/discord/callback`;
                const data = await discordService.exchangeCode(code, redirectUri);
                setSession(data.user, data.token);
                localStorage.setItem('discord_guilds', JSON.stringify(data.guilds || []));
                sessionStorage.removeItem('discord_oauth_redirect_uri');
                navigate('/dashboard', { replace: true });
            } catch (apiError) {
                if (mounted) {
                    setError(formatApiError(apiError, t('oauth.error_exchange')));
                    setLoading(false);
                }
            }
        }

        handleOAuth();

        return () => {
            mounted = false;
        };
    }, [navigate, searchParams, setSession, t]);

    return (
        <div className="min-h-screen px-4 py-16 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/90 border border-white rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-3">{t('oauth.title')}</h1>
                {loading ? <p className="text-slate-600">{t('oauth.processing')}</p> : null}
                {error ? (
                    <>
                        <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">{error}</p>
                        <Link to="/login" className="btn btn-soft">{t('oauth.back_login')}</Link>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default DiscordCallback;

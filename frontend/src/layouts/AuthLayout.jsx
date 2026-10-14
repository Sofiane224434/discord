// layouts/AuthLayout.jsx
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
function AuthLayout() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen">
            <div className="p-4">
                <Link to="/" className="auth-back-link text-sm">
                    {t('common.back_home')}
                </Link>
            </div>
            <Outlet />
        </div>
    );
}
export default AuthLayout;
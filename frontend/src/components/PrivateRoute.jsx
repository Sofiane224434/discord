// components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from './LoadingScreen.jsx';

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    if (loading) {
        return <LoadingScreen fullScreen label={t('loading.session')} subtext={t('loading.session_sub')} />;
    }
if (!isAuthenticated) {
return <Navigate to="/login" state={{ from: location }} replace />;
}
return children;
}
export default PrivateRoute;
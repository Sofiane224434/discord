// components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from './LoadingScreen.jsx';

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen fullScreen label="Vérification de session…" subtext="Connexion sécurisée en cours" />;
    }
if (!isAuthenticated) {
return <Navigate to="/login" state={{ from: location }} replace />;
}
return children;
}
export default PrivateRoute;
// layouts/AuthLayout.jsx
import { Link, Outlet } from 'react-router-dom';
function AuthLayout() {
    return (
        <div className="min-h-screen">
            <div className="p-4">
                <Link to="/" className="auth-back-link text-sm">
                    ← Retour à l’accueil
                </Link>
            </div>
            <Outlet />
        </div>
    );
}
export default AuthLayout;
// layouts/AuthLayout.jsx
import { Link, Outlet } from 'react-router-dom';
function AuthLayout() {
    return (
        <div className="min-h-screen">
            <div className="p-4">
                <Link to="/" className="text-teal-700 hover:underline text-sm mono">
                    ← Retour au Control Center
                </Link>
            </div>
            <Outlet />
        </div>
    );
}
export default AuthLayout;
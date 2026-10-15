import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ScrollManager from '../components/ScrollManager.jsx';
import PrivacyNotice from '../components/PrivacyNotice.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

function MainLayout() {
    const { pathname } = useLocation();
    return (
        <div className="draft-shell">
            <ScrollManager />
            <Header />
            <main className="draft-main" id="contenu">
                {/* Une page qui plante n'emporte pas l'en-tête ; changer de page réessaie */}
                <ErrorBoundary key={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Footer />
            <PrivacyNotice />
        </div>
    );
}

export default MainLayout;
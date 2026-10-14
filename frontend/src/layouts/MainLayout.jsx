import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ScrollManager from '../components/ScrollManager.jsx';
import PrivacyNotice from '../components/PrivacyNotice.jsx';

function MainLayout() {
    return (
        <div className="draft-shell">
            <ScrollManager />
            <Header />
            <main className="draft-main" id="contenu">
                <Outlet />
            </main>
            <Footer />
            <PrivacyNotice />
        </div>
    );
}

export default MainLayout;
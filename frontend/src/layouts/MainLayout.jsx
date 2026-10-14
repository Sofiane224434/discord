import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ThemeUnlockModal from '../components/ThemeUnlockModal.jsx';
import ScrollManager from '../components/ScrollManager.jsx';

function MainLayout() {
    return (
        <div className="draft-shell">
            <ScrollManager />
            <Header />
            <main className="draft-main">
                <Outlet />
            </main>
            <Footer />
            <ThemeUnlockModal />
        </div>
    );
}

export default MainLayout;
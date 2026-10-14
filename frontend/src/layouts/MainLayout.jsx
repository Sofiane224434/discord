import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ScrollManager from '../components/ScrollManager.jsx';
import FoldGuard from '../components/FoldGuard.jsx';

function MainLayout() {
    return (
        <div className="draft-shell">
            <ScrollManager />
            <FoldGuard />
            <Header />
            <main className="draft-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;
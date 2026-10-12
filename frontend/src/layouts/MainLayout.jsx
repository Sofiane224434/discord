import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ThemeUnlockModal from '../components/ThemeUnlockModal.jsx';

function MainLayout() {
    return (
        <div className="site-layout-with-sidebar">
            <Header />
            <div className="site-layout-main-wrapper">
                <Outlet />
                <Footer />
            </div>
            <ThemeUnlockModal />
        </div>
    );
}
export default MainLayout;
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ThemeUnlockModal from '../components/ThemeUnlockModal.jsx';

function MainLayout() {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
            <ThemeUnlockModal />
        </div>
    );
}
export default MainLayout;
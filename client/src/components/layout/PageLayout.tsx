import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from '../auth/AuthModal';
import { Toaster } from 'react-hot-toast';

const PageLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16 md:pt-18">
      <Outlet />
    </main>
    <Footer />
    <AuthModal />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#191c1d',
          border: '1px solid rgba(227, 190, 182, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.15)',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#ff5c35', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ba1a1a', secondary: '#fff' } },
      }}
    />
  </div>
);

export default PageLayout;

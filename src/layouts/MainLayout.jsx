import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { session, profile } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Note: The search logic is moved to the Footer component itself
  return (
    <div className="app-container">
      <Navbar session={session} profile={profile} />
      <main className={`main-content ${isHomePage ? 'main-content-home' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
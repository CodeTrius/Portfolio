import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '../../context/SupabaseContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ session, profile }) => {
  const { t } = useTranslation();
  const { client } = useSupabase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (client) {
      await client.auth.signOut();
      navigate('/'); // Redirect to home after logout
    }
  };

  return (
    <nav className="nav-wrapper">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate('/')}>ArchiLyra</div>
        <div className="nav-links-container">
          <div className="nav-links">
            <NavLink to="/" className="nav-link">{t('nav_home')}</NavLink>
            <NavLink to="/about" className="nav-link">{t('nav_about')}</NavLink>
            <NavLink to="/portfolio" className="nav-link">{t('nav_portfolio')}</NavLink>
            <NavLink to="/content" className="nav-link">{t('nav_content')}</NavLink>
            <NavLink to="/contact" className="nav-link">{t('nav_contact')}</NavLink>
            {session && <NavLink to="/admin" className="nav-link">{t('nav_panel')}</NavLink>}
          </div>
          <div className="user-info">
            {profile ? (
              <>
                <NavLink to="/profile" className="nav-link" style={{ color: 'var(--text-color)' }}>
                  <span>{t('greeting', { name: profile.full_name })}</span>
                </NavLink>
                <button onClick={handleLogout} className="logout-button">{t('logout')}</button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link" style={{ fontWeight: 'bold' }}>{t('nav_login')}</NavLink>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
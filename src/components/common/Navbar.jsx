import React, { useState } from 'react'; // Adicione o 'useState'
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; // Presumindo que este componente existe

// Ajuste o caminho da importação se o seu useSupabase estiver em outro lugar
// Se não for usado aqui, pode ser removido
// import { useSupabase } from '../../context/SupabaseContext'; 

const Navbar = ({ session, profile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { client } = useSupabase(); // Descomente se usar o client para o logout

  // --- 1. NOVO ESTADO PARA CONTROLAR O MENU ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    // A sua lógica de logout aqui...
    // Exemplo:
    // await client.auth.signOut();
    navigate('/');
  };

  // Função para fechar o menu ao clicar num link
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="nav-wrapper">
      <div className="container nav-container">
        <div className="nav-logo" onClick={() => navigate('/')}>ArchiLyra</div>

        {/* --- 2. LINKS DO DESKTOP --- */}
        {/* Envolvemos a navegação do desktop num div para poder escondê-la */}
        <div className="nav-links-desktop">
          <div className="nav-links">
            <NavLink to="/" className="nav-link">Home</NavLink>
            <NavLink to="/about" className="nav-link">Sobre</NavLink>
            <NavLink to="/portfolio" className="nav-link">Projetos</NavLink>
            <NavLink to="/content" className="nav-link">Conteúdo</NavLink>
            <NavLink to="/contact" className="nav-link">Contato</NavLink>
          </div>
          <div className="user-info">
            {profile ? (
              <>
                <NavLink to="/profile" className="nav-link">{t('greeting', { name: profile.full_name })}</NavLink>
                <button onClick={handleLogout} className="logout-button">Sair</button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link">Login</NavLink>
            )}
            <LanguageSwitcher />
          </div>
        </div>

        {/* --- 3. BOTÃO HAMBÚRGUER (SÓ APARECE EM TELAS PEQUENAS) --- */}
        <button className="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'} {/* Mostra um X quando o menu está aberto */}
        </button>

        {/* --- 4. MENU MOBILE (SÓ APARECE QUANDO isMenuOpen É TRUE) --- */}
        {isMenuOpen && (
          <div className="nav-links-mobile">
            <NavLink to="/" className="nav-link" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/about" className="nav-link" onClick={closeMenu}>Sobre</NavLink>
            <NavLink to="/portfolio" className="nav-link" onClick={closeMenu}>Projetos</NavLink>
            <NavLink to="/content" className="nav-link" onClick={closeMenu}>Conteúdo</NavLink>
            <NavLink to="/contact" className="nav-link" onClick={closeMenu}>Contato</NavLink>
            <div className="mobile-user-info">
              {profile ? (
                <>
                  <NavLink to="/profile" className="nav-link" onClick={closeMenu}>{t('greeting', { name: profile.full_name })}</NavLink>
                  <button onClick={() => { handleLogout(); closeMenu(); }} className="logout-button">Sair</button>
                </>
              ) : (
                <NavLink to="/login" className="nav-link" onClick={closeMenu}>Login</NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
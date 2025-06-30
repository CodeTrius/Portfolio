import React from 'react';
import { Link } from 'react-router-dom'; // Usar Link em vez de botões com setPage
import { useAuth } from '../../hooks/useAuth';

const AdminDashboardPage = () => {
  const { profile } = useAuth();

  //const navigate = useNavigate();
  return (
    <div className="admin-dashboard">
      <Link to="/" className="back-button2">
        &larr; Voltar para a Homepage
      </Link>
      <h2>Painel de Controle</h2>
      <p>Bem-vindo, {profile?.full_name || 'usuário'}. Selecione a área que deseja gerenciar.</p>

      <div className="admin-dashboard-buttons">

        <Link to="/admin/projects"><button>Gerenciar Projetos</button></Link>
        {profile && profile.role === 'admin' && (
          <>
            <Link to="/admin/content"><button>Gerenciar Conteúdo</button></Link>
            <Link to="/admin/stats"><button>Ver Estatísticas</button></Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';

const AdminLayout = () => {
  const { session, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <Loading />;
  }

  // Se não houver sessão, redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se houver sessão, mostra a página de admin solicitada (Dashboard, Projects, etc.)
  return <Outlet />;
};

export default AdminLayout;
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', margin: '5rem auto' }}>
      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/">
        <button>Voltar para a Home</button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
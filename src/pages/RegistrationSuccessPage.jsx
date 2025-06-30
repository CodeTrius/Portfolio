import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="registration-success-container">
      <h2>Cadastro Realizado com Sucesso!</h2>
      <p>
        Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta antes de fazer o login.
      </p>
      <button
        onClick={() => navigate('/login')}
        style={{ marginTop: '2rem' }}
      >
        Voltar para a Página de Login
      </button>
    </div>
  );
};

export default RegistrationSuccessPage;
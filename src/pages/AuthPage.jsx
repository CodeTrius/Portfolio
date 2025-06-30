import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const { client } = useSupabase();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    let loginEmail = identifier;

    if (!identifier.includes('@')) {
      setMessage('Buscando e-mail pelo nome de usuário...');
      try {
        const { data, error } = await client.rpc('get_email_by_username', { p_username: identifier });
        if (error || !data) { throw new Error('Usuário não encontrado.'); }
        loginEmail = data;
      } catch (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    setMessage('Autenticando...');
    const { error: signInError } = await client.auth.signInWithPassword({
      email: loginEmail,
      password: password
    });

    setLoading(false);
    if (signInError) {
      setMessage("Falha no login. Verifique suas credenciais.");
    } else {
      navigate('/admin');
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (!client) return;
    const { error } = await client.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) {
      setMessage(`Erro ao tentar logar com ${provider}: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input type="text" placeholder="Usuário ou email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? message || 'Entrando...' : 'Entrar'}
        </button>
        {!loading && message && <p className="auth-message">{message}</p>}
      </form>

      <div className="social-button-container">
        <button onClick={() => handleOAuthLogin('google')} className="google-button">
          Entrar com Google
        </button>
        <button onClick={() => handleOAuthLogin('facebook')} className="facebook-button">
          Entrar com Facebook
        </button>
      </div>

      <p className="auth-switch-text">
        Não tem uma conta?{' '}
        <Link to="/register" className="auth-switch-link">
          Registre-se
        </Link>
      </p>
    </div>
  );
};

export default AuthPage;
// /src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';

const ProfilePage = () => {
  const { client } = useSupabase();
  const { session, profile, fetchProfile, loadingAuth } = useAuth(); // Usando o hook de autenticação
  const navigate = useNavigate(); // Usando o hook de navegação

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // O estado do formulário agora é inicializado com o 'profile' do hook
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para redirecionar se o usuário não estiver logado
  useEffect(() => {
    if (!loadingAuth && !session) {
      navigate('/login');
    }
  }, [session, loadingAuth, navigate]);

  // Efeito para buscar os favoritos do usuário logado
  useEffect(() => {
    // Sincroniza o nome no formulário caso o perfil carregue
    if (profile) {
        setFullName(profile.full_name);
    }

    const fetchFavorites = async () => {
      if (!session || !client) return;
      setLoadingFavorites(true);
      
      const { data, error } = await client
        .from('user_post_favorites')
        .select('content_posts(*, category: content_categories(name))') // Simplificado
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar favoritos:", error);
      } else if (data) {
        // A estrutura dos dados pode ser um pouco diferente, ajuste se necessário
        setFavorites(data.map(fav => fav.content_posts));
      }
      setLoadingFavorites(false);
    };

    fetchFavorites();
  }, [client, session, profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    // Atualiza o nome do perfil
    const { error: profileError } = await client.from('profiles').update({ full_name: fullName }).eq('id', session.user.id);
    if (profileError) {
      setMessage({ type: 'error', text: 'Erro ao atualizar o nome: ' + profileError.message });
      setIsSubmitting(false);
      return;
    }

    // Atualiza a senha se preenchida
    if (password) {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' });
        setIsSubmitting(false);
        return;
      }
      const { error: authError } = await client.auth.updateUser({ password: password });
      if (authError) {
        setMessage({ type: 'error', text: 'Erro ao atualizar a senha: ' + authError.message });
        setIsSubmitting(false);
        return;
      }
    }

    setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    await fetchProfile(session.user); // Re-busca o perfil para atualizar a UI
    setIsEditing(false);
    setPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
  };
  
  // Mostra o loading enquanto a autenticação está sendo verificada
  if (loadingAuth || !profile) {
    return <Loading />;
  }

  return (
    <div>
      <h2 style={{ borderBottom: 'none' }}>Seu Perfil</h2>
      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="profile-form-container">
          <div className="profile-form-group">
            <label>Nome Completo</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="profile-form-group">
            <label>Nova Senha (deixe em branco para não alterar)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="profile-form-group-last">
            <label>Confirmar Nova Senha</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <div className="profile-form-buttons">
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancelar</button>
          </div>
          {message.text && <p className={`profile-message ${message.type}`}>{message.text}</p>}
        </form>
      ) : (
        <div className="profile-display-container">
          <p><strong>Nome:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
          {message.text && message.type === 'success' && <p className={`profile-message ${message.type}`}>{message.text}</p>}
        </div>
      )}

      <div className="favorites-section">
        <h3>Meus Favoritos</h3>
        {loadingFavorites ? <p>Carregando favoritos...</p> : (
          favorites.length > 0 ? (
            favorites.map(post => (
              post && (
                <div
                  key={post.id}
                  className="favorite-item-card"
                  onClick={() => navigate(`/content/post/${post.id}`)} // Navegação com o hook
                >
                  <p>{post.title}</p>
                  <small>Da Categoria: {post.category?.name}</small>
                </div>
              )
            ))
          ) : <p>Você ainda não favoritou nenhum post.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import QuizComponent from '../components/quiz/QuizComponent';
import MemoizedPostContent from '../components/post/MemoizedPostContent';

const ContentPostPage = () => {
  const { postId } = useParams(); // Pega o ID da URL
  const { client } = useSupabase();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);
  const [postSeries, setPostSeries] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    if (client && postId) {
      const fetchPostData = async () => {
        setLoading(true);
        setError(null);

        // 1. Fetch o post atual
        const { data: postData, error: postError } = await client
          .from('content_posts')
          .select('*, quiz_data, file_url, video_url, file_display_name, video_display_name, favorites_count, creator:profiles!user_id(full_name), category:content_categories(name)')
          .eq('id', postId)
          .single();

        if (postError || !postData) {
          setError("Post não encontrado ou falha ao carregar.");
          setLoading(false);
          return;
        }
        
        setPost(postData);
        setFavoriteCount(postData.favorites_count || 0);

        // 2. Fetch a série inteira para os links de Próximo/Anterior
        const { data: seriesData } = await client
          .from('content_posts')
          .select('id, title, part_number')
          .eq('category_id', postData.category_id)
          .order('part_number', { ascending: true });
        
        setPostSeries(seriesData || []);
        
        // 3. Incrementa a visualização
        client.rpc('increment_post_view', { p_post_id: postData.id });

        setLoading(false);
      };

      fetchPostData();
    }
  }, [client, postId]);
  
  // Efeito para buscar o status de favorito
  useEffect(() => {
      if(session && post) {
          const fetchFavoriteStatus = async () => {
              setIsFavoriteLoading(true);
              const { data, error } = await client
                .from('user_post_favorites')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', session.user.id)
                .maybeSingle();

              if(error) console.error("Erro ao checar favorito:", error);
              setIsFavorited(!!data);
              setIsFavoriteLoading(false);
          };
          fetchFavoriteStatus();
      }
  }, [client, session, post]);

  const handleToggleFavorite = async () => {
    // 1. Guardas de segurança: não faz nada se não estiver logado ou se o post não carregou.
    if (!session || !post || isFavoriteLoading) {
      return;
    }
    
    setIsFavoriteLoading(true);

    try {
      const { data, error } = await client.rpc('toggle_favorite', {
        post_id_to_toggle: post.id,
        user_id_to_check: session.user.id
      });

      if (error) {
        // Se der erro, exibe no console.
        throw error;
      }
      
      // 3. Atualiza a UI (a tela) imediatamente com base na resposta do Supabase
      if (data === 'favorited') {
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
      } else if (data === 'unfavorited') {
        setIsFavorited(false);
        setFavoriteCount(prev => prev - 1);
      }

    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  
  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error} <Link to="/content">Voltar para a lista.</Link></p>;
  if (!post) return <p>Post não encontrado.</p>;
  
  // Lógica para Próximo/Anterior
  const currentIndex = postSeries.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? postSeries[currentIndex - 1] : null;
  const nextPost = currentIndex < postSeries.length - 1 ? postSeries[currentIndex + 1] : null;

  return (
    <div>
      <button onClick={() => navigate('/content')} className="back-button">
        &larr; Voltar para a lista de tópicos
      </button>
      <div className="content-post-view">
        <h2>{post.title}</h2>
        <div className="post-meta-bar">
          <p className="post-meta-text">
            {post.category?.name} | Parte {post.part_number} | Por: {post.creator?.full_name || 'Desconhecido'}
          </p>
          {session && (
             <button
                className={`favorite-button ${isFavorited ? 'favorited' : 'not-favorited'}`}
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
              >
                <span>⭐</span>
                <span>{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
                <span className="favorite-count">{favoriteCount}</span>
              </button>
          )}
        </div>

        <MemoizedPostContent htmlContent={post.content} />
        
        {/* Seção de Anexos */}
        {(post.video_url || post.file_url) && (
            <div className="attachments-section">
              <h4 style={{ marginTop: 0, color: 'var(--accent-color)' }}>Recursos Adicionais</h4>
              {post.video_url && (
                <div style={{ marginBottom: '1rem' }}>
                  {post.video_display_name && <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{post.video_display_name}</p>}
                  <video key={post.video_url} controls width="100%" style={{ borderRadius: '8px' }}>
                    <source src={post.video_url} type="video/mp4" /> Seu navegador não suporta a tag de vídeo.
                  </video>
                </div>
              )}
              {post.file_url && (
                <div>
                  <a href={post.file_url} download target="_blank" rel="noopener noreferrer" className="share-button" style={{ display: 'inline-block' }}>
                    {post.file_display_name || 'Baixar Arquivo Anexo'}
                  </a>
                </div>
              )}
            </div>
        )}

        <QuizComponent quizData={post.quiz_data} />

        {/* Seção de Compartilhamento */}
        <div className="share-container">
            {/* ... seus botões de compartilhar ... */}
        </div>

        {/* Navegação entre Posts */}
        <div className="post-navigation">
          {prevPost ? (
            <Link to={`/content/post/${prevPost.id}`} className="back-button" style={{marginBottom: 0}}>
              &larr; Parte {prevPost.part_number}: {prevPost.title}
            </Link>
          ) : (<div />)}
           {nextPost ? (
            <Link to={`/content/post/${nextPost.id}`} className="back-button" style={{marginBottom: 0}}>
              Parte {nextPost.part_number}: {nextPost.title} &rarr;
            </Link>
          ) : (<div />)}
        </div>
      </div>
    </div>
  );
};

export default ContentPostPage;
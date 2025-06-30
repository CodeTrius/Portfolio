import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import Loading from '../components/common/Loading';

const HomePage = () => {
  const { t } = useTranslation();
  const { client } = useSupabase();
  const navigate = useNavigate();
  const [latestPosts, setLatestPosts] = useState([]);
  const [latestProjects, setLatestProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    const fetchLatestItems = async () => {
      setLoading(true);
      const postPromise = client
        .from('content_posts')
        .select('id, title, category:content_categories(name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      const projectPromise = client
        .from('projects')
        .select('id, title, excerpt, category:categories(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      const [postResult, projectResult] = await Promise.all([postPromise, projectPromise]);
      
      if (postResult.data) setLatestPosts(postResult.data);
      if (projectResult.data) setLatestProjects(projectResult.data);
      setLoading(false);
    };
    fetchLatestItems();
  }, [client]);

  if (loading) return <Loading />;

  return (
    <div className="home-page-style">
      <h1 className="home-title">
        <span className="home-title-accent">Uma Abordagem Multidisciplinar.</span>
      </h1>
      <p className="home-subtitle">
        Bem-vindo a este espaço digital.
        <br />
        Este ambiente une ensino, pesquisa e prática.
      </p>

      <div className="latest-items-container">
        {/* Coluna de Posts */}
        <div className="home-card-column">
          <h2 className="home-column-title">Últimos Posts</h2>
          {latestPosts.map(post => (
            <div key={post.id} className="home-card">
              <div className="card-content">
                <h3 className="card-title">{post.title}</h3>
                {post.category && <p className="card-category">Categoria: {post.category.name}</p>}
              </div>
              <button onClick={() => navigate(`/content/post/${post.id}`)} className="btn-card">
                Leia Mais →
              </button>
            </div>
          ))}
        </div>

        {/* Coluna de Projetos */}
        <div className="home-card-column">
          <h2 className="home-column-title">Últimos Projetos</h2>
          {latestProjects.map(project => (
            <div key={project.id} className="home-card">
              <div className="card-content">
                <h3 className="card-title">{project.title}</h3>
                {project.category && <p className="card-category">Categoria: {project.category.name}</p>}
                <p className="card-excerpt">{project.excerpt}</p>
              </div>
              <button onClick={() => navigate('/portfolio')} className="btn-card btn-project">
                Ver Projetos ◆
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
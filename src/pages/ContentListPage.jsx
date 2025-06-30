import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import Loading from '../components/common/Loading';

const ContentListPage = () => {
  const { client } = useSupabase();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subcategoriesToShow, setSubcategoriesToShow] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState({});

  useEffect(() => {
    if (client) {
      const fetchTopics = async () => {
        setLoading(true);
        
        // --- 1. ATUALIZAR A CONSULTA AO SUPABASE ---
        // Adicionamos ", content_posts(count)" para que o Supabase já nos traga a contagem de posts para cada categoria.
        const { data, error } = await client
          .from('content_categories')
          .select('*, content_posts(count)') // <-- MUDANÇA AQUI
          .order('name');
        
        if (error) {
          setError(`Falha ao carregar tópicos: ${error.message}`);
        } else {
          const fetchedTopics = data || [];
          setTopics(fetchedTopics);

          const counts = {};
          fetchedTopics.forEach(topic => {
            if (topic.parent_id) {
              counts[topic.parent_id] = (counts[topic.parent_id] || 0) + 1;
            }
          });
          setSubcategoryCounts(counts);
        }
        setLoading(false);
      };
      fetchTopics();
    }
  }, [client]);
  
  const navigateToPosts = async (categoryId) => {
    setLoading(true);
    const now = new Date().toISOString();
    const { data, error } = await client
      .from('content_posts')
      .select('id')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .order('part_number', { ascending: true })
      .limit(1)
      .single();
    
    setLoading(false);
    if (error || !data) {
      setError(`Este tópico ainda não possui conteúdo publicado ou ocorreu um erro.`);
    } else {
      navigate(`/content/post/${data.id}`);
    }
  };

  const handleMainTopicClick = (topic) => {
    const children = topics.filter(t => t.parent_id === topic.id);
    setSelectedTopic(topic);
    setSubcategoriesToShow(children);
  };

  const handleSubcategoryClick = (subcategory) => {
    navigateToPosts(subcategory.id);
  };
  
  const mainTopics = topics.filter(t => t.parent_id === null);

  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div>
      <div className="content-header">
        <h2>Conteúdo</h2>
        <p>Explore por tópicos e expanda seu conhecimento.</p>
      </div>
      <div className="content-layout-container">
        <div className="category-list-panel">
          <div className="category-list-header">Tópicos Principais</div>
          {mainTopics.map(topic => {
            const count = subcategoryCounts[topic.id] || 0;
            return (
              <div 
                key={topic.id} 
                className={`category-item ${selectedTopic?.id === topic.id ? 'active' : ''}`} 
                onClick={() => handleMainTopicClick(topic)}
              >
                <span>{topic.name}</span>
                {count > 0 && <span style={{ marginLeft: 'auto', color: 'var(--subtle-text-color)', fontSize: '0.9rem' }}>({count})</span>}
              </div>
            );
          })}
        </div>

        <div className="subcategory-panel">
          {selectedTopic ? (
            subcategoriesToShow.length > 0 ? (
              <div>
                <h3 style={{color: 'var(--text-color)', fontFamily: 'Montserrat, sans-serif'}}>{selectedTopic.name}</h3>
                {subcategoriesToShow.map(sub => {
                  // --- 2. EXIBIR A CONTAGEM DE POSTS NA SUBCATEGORIA ---
                  // O Supabase retorna a contagem como um array, por isso acessamos o primeiro item.
                  const postCount = sub.content_posts[0]?.count || 0;
                  return (
                    <div key={sub.id} className="subcategory-card" onClick={() => handleSubcategoryClick(sub)}>
                      {/* Adicionamos a contagem aqui */}
                      <h4>- {sub.name} <span style={{color: 'var(--subtle-text-color)', fontWeight: 'normal'}}>({postCount})</span></h4>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="subcategory-placeholder">
                <span className="subcategory-placeholder-icon">📄</span>
                <h4>Este tópico não possui subcategorias.</h4>
                <p>Você pode ver os posts diretamente relacionados a "{selectedTopic.name}".</p>
                <button onClick={() => navigateToPosts(selectedTopic.id)} style={{marginTop: '1rem'}}>
                  Ver Posts
                </button>
              </div>
            )
          ) : (
            <div className="subcategory-placeholder">
              <span className="subcategory-placeholder-icon">←</span>
              <h4>Selecione um tópico</h4>
              <p>Escolha um item na lista ao lado para ver os posts ou sub-tópicos relacionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;
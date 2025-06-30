import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import Loading from '../components/common/Loading';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { client } = useSupabase();

  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !client) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await client.rpc('search_posts', {
        search_term: query
      });

      if (error) {
        console.error("Erro na busca:", error);
        setResults([]);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };

    performSearch();
  }, [query, client]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h2>Resultados da Busca por "{query}"</h2>
      {results.length > 0 ? (
        results.map(post => (
          <div 
            key={post.id} 
            className="content-card" // Usando uma classe genérica para estilo
            style={{cursor: 'pointer'}}
            onClick={() => navigate(`/content/post/${post.id}`)}
          >
            <h3 style={{ marginTop: 0 }}>{post.title}</h3>
            <p style={{ margin: '0.5rem 0', color: 'var(--subtle-text-color)' }}>
              {post.excerpt || 'Clique para ler mais...'}
            </p>
            <small style={{ color: 'var(--accent-color)' }}>
              Categoria: {post.category_name} | Parte {post.part_number}
            </small>
          </div>
        ))
      ) : (
        <p>Nenhum resultado encontrado para "{query}".</p>
      )}
    </div>
  );
};

export default SearchResultsPage;
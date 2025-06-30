import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import Loading from '../components/common/Loading';

const PortfolioPage = () => {
  const { t } = useTranslation();
  const { client, loading: supabaseLoading } = useSupabase();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (supabaseLoading || !client) return;
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await client
        .from('projects')
        .select(`*, creator:profiles(full_name), category:categories(name, parent:categories(name))`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setError(t('portfolio_error'));
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [client, supabaseLoading, t]);

  if (loading || supabaseLoading) return <Loading />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  const disciplines = ['All', ...new Set(projects.map(p => p.category?.name).filter(Boolean))];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category?.name === filter);
  
  const filterButtonStyle = (isActive) => ({
      background: isActive ? 'var(--accent-color)' : 'var(--secondary-color)',
      color: isActive ? 'var(--primary-color)' : 'var(--subtle-text-color)',
      border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: 'none'
  });

  return (
    <div>
      <h2 className="portfolio-title">{t('portfolio_title')}</h2>
      <div className="filter-container">
        {disciplines.map(d => (
            <button key={d} onClick={() => setFilter(d)} style={filterButtonStyle(d === filter)}>{d}</button>
        ))}
      </div>
      <div className="project-grid">
        {filteredProjects.map(project => {
          const categoryName = project.category?.name || '';
          const parentCategoryName = project.category?.parent?.name || null;
          const displayCategory = parentCategoryName ? `${parentCategoryName} / ${categoryName}` : categoryName;

          return (
            <div key={project.id} className="project-card">
              {project.thumbnail_url && (
                <div className="project-card-image-container">
                  <img src={project.thumbnail_url} alt={`${project.title} thumbnail`} className="project-card-image" />
                </div>
              )}
              <div className="project-card-text-container">
                <div style={{flexGrow: 1}}>
                    {categoryName && <span className="project-tag">{displayCategory}</span>}
                    <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                    {project.creator?.full_name && (<p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', margin: '0' }}>{t('portfolio_created_by', { name: project.creator.full_name })}</p>)}
                    {project.created_at && (<p style={{ color: 'var(--subtle-text-color)', fontSize: '0.9rem' }}>{t('portfolio_year', { year: new Date(project.created_at).getFullYear() })}</p>)}
                    <p>{project.excerpt || "Este projeto ainda não tem um resumo."}</p>
                </div>
                <Link to={`/portfolio/${project.id}`} className="see-more-button">
                  {t('portfolio_see_more')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '../context/SupabaseContext';
import Loading from '../components/common/Loading';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { client } = useSupabase();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !client) return;
      setLoading(true);
      const { data, error } = await client
        .from('projects')
        .select(`*, creator:profiles(full_name), category:categories(name, parent:categories(name))`)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project detail:', error);
        setError('Projeto não encontrado.');
      } else {
        setProject(data);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId, client]);

  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  if (!project) return null;

  const categoryName = project.category ? project.category.name : '';
  const parentCategoryName = project.category?.parent?.name;
  const displayCategory = parentCategoryName ? `${parentCategoryName} / ${categoryName}` : categoryName;

  return (
    <div>
      <button onClick={() => navigate('/portfolio')} className="back-button">{t('detail_back_button')}</button>
      <div className="project-detail-container">
        <h2>{project.title}</h2>
        <div className="project-meta-info">
          {project.created_at && (<span>{t('portfolio_year', { year: new Date(project.created_at).getFullYear() })}</span>)}
          {project.creator?.full_name && (<span><span className="project-meta-separator"> | </span>{t('portfolio_created_by', { name: project.creator.full_name })}</span>)}
          {categoryName && (<span><span className="project-meta-separator"> | </span>Categoria: <span style={{ color: 'var(--accent-color)' }}>{displayCategory}</span></span>)}
        </div>
        
        {/* Usando dangerouslySetInnerHTML para caso a descrição tenha HTML, mas com cuidado.
            Se a descrição for texto puro, um simples <p>{project.description}</p> é mais seguro.
        */}
        <div dangerouslySetInnerHTML={{ __html: project.description }} />
        
        {project.image_url && (
            <img src={project.image_url} alt={project.title} style={{width: '100%', marginTop: '1.5rem', borderRadius: '8px'}} />
        )}
        
        {project.file_url && (
            <a href={project.file_url} className="see-more-button" target="_blank" rel="noopener noreferrer" style={{marginTop: '1.5rem', display: 'inline-block'}}>
                Ver Arquivo do Projeto
            </a>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
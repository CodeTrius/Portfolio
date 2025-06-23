import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import DOMPurify from 'dompurify';
import Placeholder from '@tiptap/extension-placeholder';

// --- SUPABASE SETUP ---
// Credentials are still needed here, but the client is created dynamically.
const supabaseUrl = 'https://hxrznwmxaazhnysmytwz.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cnpud214YWF6aG55c215dHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODk2MzMsImV4cCI6MjA2NTg2NTYzM30.hYniWFKWz9cgVwkBIQw1slQ2POil44q5mmWVbGSXKw0'; // Replace with your Supabase anon key

// --- SUPABASE CONTEXT & PROVIDER ---
const SupabaseContext = createContext(null);

const SupabaseProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't try to load if credentials are not set
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.warn("Supabase credentials are not set. Skipping client initialization.");
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.async = true;

    script.onload = () => {
      if (window.supabase) {
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        setClient(supabaseClient);
      } else {
        console.error("Supabase script loaded but `window.supabase` is not found.");
      }
      setLoading(false);
    };

    script.onerror = () => {
      console.error('Failed to load Supabase script.');
      setLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup: remove the script when the component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ client, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Custom hook to easily access the Supabase client
const useSupabase = () => useContext(SupabaseContext);

// --- STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Montserrat:wght@400;700&display=swap');

  :root {
    --primary-color: #0a0a23;
    --secondary-color: #1b1b32;
    --accent-color: #00f5a0;
    --text-color: #f5f6f7;
    --subtle-text-color: #d0d0d5;
    --border-color: #3b3b4f;
    --shadow-color: rgba(0, 245, 160, 0.2);
    --success-color: #28a745;
    --error-color: #dc3545;
  }

  body {
    margin: 0;
    font-family: 'Roboto', sans-serif;
    background-color: var(--primary-color);
    color: var(--text-color);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* Main content area is now a centered container with max-width */
.main-content {
  flex-grow: 1;
  padding: 2rem;
  width: 100%;
  /* Remova ou comente a linha abaixo */
  /* max-width: 1200px; */
  margin: 0;
  box-sizing: border-box;
}
  
  /* Style for centering the homepage content vertically */
  .main-content-home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* Center horizontally as well */
  }

  h1, h2, h3 {
    font-family: 'Montserrat', sans-serif;
    color: var(--accent-color);
  }
  
  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
  p { line-height: 1.6; color: var(--subtle-text-color); }
  a { color: var(--accent-color); text-decoration: none; transition: color 0.3s ease; }
  a:hover { color: #fff; }

  button {
    background-color: var(--accent-color);
    color: var(--primary-color);
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: bold;
    font-family: 'Montserrat', sans-serif;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px var(--shadow-color);
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px var(--shadow-color);
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .main-content {
      padding: 1rem; /* Less padding on smaller screens */
    }
  }
    
  @media (max-width: 768px) {
    h1 { font-size: 2rem; }
    h2 { font-size: 1.75rem; }
    .about-container {
      flex-direction: column;
    }
  }
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd; /* Um cinza claro */
    pointer-events: none;
    height: 0;
  }

/* Estilos para as imagens dentro do editor */
.ProseMirror img {
  max-width: 100%;
  height: auto;
}
.ProseMirror img[data-align="left"] {
  float: left;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}
.ProseMirror img[data-align="right"] {
  float: right;
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}
/* destaca a imagem selecionada */
.ProseMirror img.ProseMirror-selectednode {
  outline: 3px solid var(--accent-color);
}
`;

// --- COMPONENTS ---
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const buttonStyle = { background: 'none', border: '1px solid var(--border-color)', color: 'var(--subtle-text-color)', padding: '4px 8px', marginLeft: '0.5rem', cursor: 'pointer', borderRadius: '4px' };
  const activeButtonStyle = { ...buttonStyle, color: 'var(--accent-color)', borderColor: 'var(--accent-color)' };

  return (
    <div>
      <button style={i18n.resolvedLanguage === 'pt' ? activeButtonStyle : buttonStyle} onClick={() => i18n.changeLanguage('pt')}>PT</button>
      <button style={i18n.resolvedLanguage === 'en' ? activeButtonStyle : buttonStyle} onClick={() => i18n.changeLanguage('en')}>EN</button>
    </div>
  );
}

const Navbar = ({ setPage, session, profile, onContentLinkClick }) => {
  const { t, i18n } = useTranslation();
  const { client } = useSupabase();

  const handleLogout = async () => {
    await client.auth.signOut();
    setPage('home'); // Redireciona para home após o logout
  };

  // Estilos (sem alteração)
  const navWrapperStyle = { backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', padding: '1rem 2rem', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', width: '100%' };
  const navContainerStyle = { width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const logoStyle = { fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--text-color)' };
  const navLinksStyle = { display: 'flex', gap: '1.5rem', alignItems: 'center' };
  const linkStyle = { fontFamily: "'Montserrat', sans-serif", fontSize: '1rem', cursor: 'pointer', color: 'var(--subtle-text-color)' };
  const userInfoStyle = { display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' };
  const logoutButtonStyle = { background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '0.9rem', padding: 0, textDecoration: 'underline' };

  const mainLinks = [
    { key: 'nav_home', page: 'home' },
    { key: 'nav_about', page: 'about' },
    { key: 'nav_portfolio', page: 'portfolio' },
    //{ key: 'nav_content', page: 'content' },
    { key: 'nav_contact', page: 'contact' },
  ];

  return (
    <nav style={navWrapperStyle}>
      <div style={navContainerStyle}>
        <div style={logoStyle} onClick={() => setPage('home')}>[Your Name]</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={navLinksStyle}>
            {mainLinks.map(link => (<a key={link.key} onClick={() => setPage(link.page)} style={linkStyle}>{t(link.key)}</a>))}
            <a key="nav_content" onClick={() => { setPage('content'); onContentLinkClick(); }} style={linkStyle}>
              {t('nav_content')}
            </a>
            {session && (<a onClick={() => setPage('admin')} style={linkStyle}>{t('nav_panel')}</a>)}
          </div>
          <div style={userInfoStyle}>
            {profile ? (
              <>
                <a onClick={() => setPage('profile')} style={{ cursor: 'pointer', color: 'var(--text-color)' }}>
                  <span>{t('greeting', { name: profile.full_name })}</span>
                </a>
                <button onClick={handleLogout} style={logoutButtonStyle}>{t('logout')}</button>
              </>
            ) : (
              <a onClick={() => setPage('admin')} style={{ ...linkStyle, fontWeight: 'bold' }}>{t('nav_login')}</a>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  const footerWrapperStyle = {
    backgroundColor: 'var(--secondary-color)',
    padding: '2rem',
    borderTop: '2px solid var(--border-color)',
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box'
  };

  const footerContainerStyle = {
    width: '100%',
    // Remover ou comentar:
    // maxWidth: '1200px',
    textAlign: 'center',
  };

  const textStyle = {
    color: 'var(--subtle-text-color)',
    margin: '0.5rem 0'
  };

  return (
    <footer style={footerWrapperStyle}>
      <div style={footerContainerStyle}>
        <p style={textStyle}>© {new Date().getFullYear()} [Your Name]. All Rights Reserved.</p>
        <p style={textStyle}>Built with React & Supabase.</p>
      </div>
    </footer>
  );
};

// --- PAGES ---

const HomePage = ({ setPage }) => {
  const homeStyle = {
    textAlign: 'center',
    width: '100%' // Ensure it takes up space to be centered
  };

  const h1Style = {
    fontSize: '3.5rem',
    margin: '0',
    color: 'var(--text-color)'
  };

  const spanStyle = {
    color: 'var(--accent-color)',
    display: 'block',
    marginTop: '0.5rem',
  };

  const pStyle = {
    fontSize: '1.25rem',
    maxWidth: '600px',
    margin: '1.5rem auto 2rem auto',
  };

  return (
    <div style={homeStyle}>
      <h1 style={h1Style}>Innovate. Engineer. Solve.
        <span style={spanStyle}>A Multidisciplinary Approach.</span>
      </h1>
      <p style={pStyle}>
        Welcome to my digital space. I'm a passionate engineer and problem-solver, working at the intersection of technology, mathematics, and science.
      </p>
      <button onClick={() => setPage('portfolio')}>
        Explore My Work
      </button>
    </div>
  );
};

const AboutPage = () => {
  const aboutContainerStyle = {
    display: 'flex',
    gap: '3rem',
    alignItems: 'flex-start',
  };
  const textContainerStyle = { flex: 2 };
  const skillsContainerStyle = { flex: 1, background: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '8px' };
  const skillCategoryStyle = { marginBottom: '1rem' };
  const skillListStyle = { listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
  const skillItemStyle = { background: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '5px', fontSize: '0.9rem', color: 'var(--accent-color)' };

  const skills = {
    "Software & CS": ["Python", "C++", "JavaScript", "React", "SQL", "Git", "Supabase"],
    "Electronics": ["PCB Design", "VHDL", "Microcontrollers (STM32, ESP32)", "Signal Processing"],
    "Electrical": ["Power Systems", "Control Theory", "MATLAB/Simulink"],
    "Mathematics": ["Linear Algebra", "Calculus", "Differential Equations", "Statistics"]
  }
  const titleStyle = {
    textAlign: 'center',
    color: 'var(--accent-color)', // opcional, se quiser reforçar a cor
  };

  return (
    <div>
      <h2 style={titleStyle}>About Me</h2>
      <div style={aboutContainerStyle} className="about-container">
        <div style={textContainerStyle}>
          <p>
            Hello! I'm a dedicated and versatile engineer with a strong foundation across multiple disciplines, including computer science, electronics, and applied mathematics. My passion lies in solving complex problems by blending theoretical knowledge with hands-on application.
          </p>
          <p>
            I thrive in environments that challenge me to learn continuously and to bridge the gap between different fields of technology. Whether it's writing efficient code for an embedded system, designing a complex circuit, or modeling a physical system with mathematical precision, I am driven by the desire to build things that are both elegant and functional.
          </p>
          <p>
            This portfolio is a showcase of my journey, reflecting my skills and the projects I've poured my energy into. My goal is to leverage my multidisciplinary background to contribute to innovative projects that make a real-world impact.
          </p>
        </div>
        <div style={skillsContainerStyle}>
          <h3 style={{ marginTop: 0 }}>Core Competencies</h3>
          {Object.entries(skills).map(([category, list]) => (
            <div key={category} style={skillCategoryStyle}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{category}</h4>
              <ul style={skillListStyle}>
                {list.map(skill => <li key={skill} style={skillItemStyle}>{skill}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Componente para a visualização de detalhes do projeto ---
const ProjectDetailView = ({ project, onBack }) => {
  const { t } = useTranslation();

  const categoryName = project.category ? project.category.name : '';
  const parentCategoryName = project.category && project.category.parent ? project.category.parent.name : null;
  const displayCategory = parentCategoryName ? `${parentCategoryName} / ${categoryName}` : categoryName;

  const detailContainerStyle = { maxWidth: '800px', margin: '0 auto', background: 'var(--secondary-color)', padding: '2rem', borderRadius: '8px' };
  const backButtonStyle = { marginBottom: '2rem', background: 'var(--secondary-color)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' };
  const titleStyle = { marginTop: 0, borderBottom: '2px solid var(--accent-color)', paddingBottom: '1rem' };
  const metaInfoStyle = { color: 'var(--subtle-text-color)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0 1rem' };
  const metaSeparator = { color: 'var(--border-color)' };

  return (
    <div>
      <button onClick={onBack} style={backButtonStyle}>{t('detail_back_button')}</button>
      <div style={detailContainerStyle}>
        <h2 style={titleStyle}>{project.title}</h2>
        <div style={metaInfoStyle}>
          {project.created_at && (<span>{t('portfolio_year', { year: new Date(project.created_at).getFullYear() })}</span>)}
          {/* --- MUDANÇA AQUI: Usando optional chaining --- */}
          {project.creator?.full_name && (<span><span style={metaSeparator}> | </span>{t('portfolio_created_by', { name: project.creator.full_name })}</span>)}
          {categoryName && (<span><span style={metaSeparator}> | </span>Categoria: <span style={{ color: 'var(--accent-color)' }}>{displayCategory}</span></span>)}
        </div>
        <p>{project.description}</p>
        {project.file_url && (<a href={project.file_url} target="_blank" rel="noopener noreferrer">...</a>)}
        {project.image_url && (<img src={project.image_url} alt={project.title} />)}
      </div>
    </div>
  );
};

// Substitua seu PortfolioPage por este código completo

const PortfolioPage = () => {
  const { t } = useTranslation();
  const { client, loading: supabaseLoading } = useSupabase();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (supabaseLoading || !client) return;
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await client
        .from('projects')
        .select(`*, creator:profiles(full_name), category:categories(name, parent:categories(name))`)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error fetching projects:', error); setError(t('portfolio_error')); }
      else { setProjects(data || []); }
      setLoading(false);
    };
    fetchProjects();
  }, [client, supabaseLoading, t]);

  if (loading || supabaseLoading) return <p>{t('portfolio_loading')}</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  if (selectedProject) return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />;

  const projectGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' };
  const titleStyle = { textAlign: 'center', color: 'var(--accent-color)', fontSize: '2rem', marginBottom: '2rem' };
  const projectCardStyle = {
    background: 'var(--secondary-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    transition: 'transform 0.2s ease-in-out',
  };
  const imageContainerStyle = { flexShrink: 0, width: '180px', backgroundColor: '#0a0a23' };
  const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  const textContainerStyle = { padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 };
  const tagStyle = { display: 'inline-block', background: 'var(--accent-color)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' };
  const verMaisButtonStyle = { padding: '8px 16px', fontSize: '0.9rem', alignSelf: 'flex-start' };
  const filterContainerStyle = { marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' };
  const filterButtonStyle = (isActive) => ({ background: isActive ? 'var(--accent-color)' : 'var(--secondary-color)', color: isActive ? 'var(--primary-color)' : 'var(--subtle-text-color)', border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease' });

  const disciplines = ['All', ...new Set(projects.map(p => p.category?.name).filter(Boolean))];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category?.name === filter);

  return (
    <div>
      <h2 style={titleStyle}>{t('portfolio_title')}</h2>
      <div style={filterContainerStyle}>
        {disciplines.map(d => (<button key={d} onClick={() => setFilter(d)} style={filterButtonStyle(d === filter)}>{d}</button>))}
      </div>
      <div style={projectGridStyle}>
        {filteredProjects.map(project => {
          const categoryName = project.category?.name || '';
          const parentCategoryName = project.category?.parent?.name || null;
          const displayCategory = parentCategoryName ? `${parentCategoryName} / ${categoryName}` : categoryName;

          return (
            <div
              key={project.id}
              style={{ ...projectCardStyle, flexDirection: project.thumbnail_url ? 'row' : 'column' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Usa a thumbnail_url se ela existir */}
              {project.thumbnail_url && (
                <div style={imageContainerStyle}>
                  <img src={project.thumbnail_url} alt={`${project.title} thumbnail`} style={imageStyle} />
                </div>
              )}

              <div style={textContainerStyle}>
                <div style={{ flexGrow: 1 }}>
                  {categoryName && <span style={tagStyle}>{displayCategory}</span>}
                  <h3 style={{ marginTop: '1rem' }}>{project.title}</h3>
                  {project.creator?.full_name && (<p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>{t('portfolio_created_by', { name: project.creator.full_name })}</p>)}
                  {project.created_at && (<p style={{ color: 'var(--subtle-text-color)', fontSize: '0.9rem' }}>{t('portfolio_year', { year: new Date(project.created_at).getFullYear() })}</p>)}
                  <p>{project.excerpt || "Este projeto ainda não tem um resumo."}</p>
                </div>
                <button onClick={() => setSelectedProject(project)} style={{ ...verMaisButtonStyle, marginTop: '1rem' }}>
                  {t('portfolio_see_more')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const ContentPage = ({ session, initialPost, onPostViewed }) => {
  const { t } = useTranslation();
  const { client, loading: supabaseLoading } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (initialPost) {
      setSelectedPost(initialPost);
      if(onPostViewed) onPostViewed();
    }
  }, [initialPost, onPostViewed]);
  
  useEffect(() => {
    if (supabaseLoading || !client) return;
    const fetchSeries = async () => {
      setLoading(true);
      const { data, error } = await client.from('content_series').select('*');
      if (error) { setError('Falha ao carregar as séries de conteúdo.'); console.error(error); } 
      else { setSeriesList(data || []); }
      setLoading(false);
    };
    fetchSeries();
  }, [client, supabaseLoading]);

  useEffect(() => {
    if (!selectedSeries || !client) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      setError(null);
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // Usando a consulta estável e simplificada
      let query = client
        .from('content_posts')
        .select('*, creator:profiles!user_id(full_name)', { count: 'exact' })
        .eq('series_id', selectedSeries.id);
      
      // A RLS no backend já cuida de mostrar apenas posts publicados/agendados.
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      query = query.order('part_number', { ascending: true }).range(from, to);
      
      const { data, error, count } = await query;

      if (error) {
        setError('Falha ao carregar os posts desta série.');
        console.error("Erro na consulta Supabase:", error);
      } else {
        setPosts(data || []);
        setTotalPosts(count || 0);
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, [selectedSeries, client, currentPage, searchTerm]);
  
  useEffect(() => {
    if (!selectedPost) return;
    const checkUserFavorite = async () => { /* ... (código existente, sem alteração) ... */ };
    const fetchFavoriteCount = async () => { /* ... (código existente, sem alteração) ... */ };
    checkUserFavorite();
    fetchFavoriteCount();
  }, [selectedPost, session, client]);

  const handleToggleFavorite = async () => { /* ... (código existente, sem alteração) ... */ };

  const cardStyle = { background: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)', cursor: 'pointer', transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out' };
  const backButtonStyle = { marginBottom: '2rem', background: 'var(--secondary-color)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' };
  const timelineItemStyle = { display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative', paddingLeft: '40px' };
  const timelineIconStyle = { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2, };
  const timelineLineStyle = { position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--border-color)', zIndex: 1, };
  const timelineContentStyle = { background: 'var(--secondary-color)', padding: '1rem 1.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out', width: '100%', };
  
  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (selectedPost) {
    const sanitizedContent = selectedPost.content ? DOMPurify.sanitize(selectedPost.content) : '';
    return (
      <div>
        <button onClick={() => { setSelectedPost(null); setFavoriteCount(0); }} style={backButtonStyle}>&larr; Voltar para a lista de posts</button>
        <div style={{ background: 'var(--secondary-color)', padding: '2rem', borderRadius: '8px', minHeight: '300px' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <h2 style={{marginTop: 0, paddingRight: '1rem'}}>{selectedPost.title}</h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)'}}>
              <span>{favoriteCount}</span>
              {session ? (
                <button onClick={handleToggleFavorite} style={{background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', padding: '0'}}>
                  {isFavorited ? '❤️' : '🤍'}
                </button>
              ) : ( <span style={{fontSize: '2rem'}}>❤️</span> )}
            </div>
          </div>
          <p style={{ color: 'var(--subtle-text-color)', fontSize: '0.9rem' }}>
            Parte {selectedPost.part_number} | Criado por: {selectedPost.creator?.full_name || 'Autor desconhecido'}
          </p>
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>
      </div>
    );
  }

  if (selectedSeries) {
    return (
      <div>
        <button onClick={() => { setSelectedSeries(null); setSearchTerm(''); setCurrentPage(1); }} style={backButtonStyle}>&larr; Voltar para todas as séries</button>
        <h2>{selectedSeries.title}</h2>
        <p>{selectedSeries.description}</p>
        <input type="text" placeholder="Buscar por título no post..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '12px', marginBottom: '2rem', boxSizing: 'border-box' }}/>
        <div style={{ position: 'relative' }}>
          <div style={timelineLineStyle}></div>
          {loadingPosts ? <p>Buscando posts...</p> : (
            posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} style={timelineItemStyle}>
                  <div style={timelineIconStyle}>{post.part_number}</div>
                  <div style={timelineContentStyle} onClick={() => setSelectedPost(post)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a40'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}>
                    <h3 style={{marginTop: 0, borderBottom: 'none'}}>{post.title}</h3>
                    <small>Criado em {new Date(post.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            ) : (<p>Nenhum post encontrado.</p>)
          )}
        </div>
        {totalPosts > POSTS_PER_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1}>&larr; Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Próxima &rarr;</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Conteúdo</h2>
      <p style={{ textAlign: 'center' }}>Explore séries de aulas e artigos sobre diversos temas.</p>
      <div>
        {seriesList.length > 0 ? (
          seriesList.map(series => (
            <div key={series.id} style={cardStyle} onClick={() => setSelectedSeries(series)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a40'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}>
              {/* --- CORREÇÃO FINAL ESTÁ AQUI --- */}
              <h3 style={{marginTop: 0}}>{series.title}</h3>
              <p>{series.description}</p>
            </div>
          ))
        ) : (<p>Nenhuma série de conteúdo foi criada ainda.</p>)}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const { client } = useSupabase();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',         // ✅ Centraliza horizontalmente
    alignItems: 'center',     // ✅ Centraliza os elementos dentro do form
  };
  const inputStyle = {
    background: 'var(--secondary-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    color: 'var(--text-color)',
    fontSize: '1rem',
    width: '100%', // ✅ garante que ocupa toda a largura do form
    boxSizing: 'border-box'
  };


  const titleStyle = {
    textAlign: 'center',
    color: 'var(--accent-color)', // opcional, se quiser reforçar a cor
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) {
      setFormMessage({ type: 'error', text: 'Supabase não está configurado. Não é possível enviar a mensagem.' });
      return;
    }
    setSubmitting(true);
    setFormMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    const { name, email, message } = Object.fromEntries(formData.entries());

    const { error } = await client
      .from('contacts')
      .insert([{ name, email, message }]);

    if (error) {
      console.error('Error submitting form:', error);
      setFormMessage({ type: 'error', text: 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.' });
    } else {
      setFormMessage({ type: 'success', text: 'Obrigado! Sua mensagem foi enviada com sucesso.' });
      e.target.reset();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2 style={titleStyle}>Entre em Contato</h2>
      <p>Tem alguma pergunta, uma proposta de projeto, ou apenas quer se conectar? Sinta-se à vontade para entrar em contato.</p>
      <form style={formStyle} onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Seu Nome" required style={inputStyle} />
        <input name="email" type="email" placeholder="Seu Email" required style={inputStyle} />
        <textarea name="message" rows="6" placeholder="Sua Mensagem" required style={{ ...inputStyle, resize: 'vertical' }}></textarea>
        <button type="submit" disabled={submitting || !client}>
          {submitting ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
        {formMessage.text && (
          <p style={{ color: `var(--${formMessage.type}-color)` }}>
            {formMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};
// --- ADMIN PORTFOLIO COMPONENT ---

// Substitua TODO o seu componente AdminProjectsPage por este código completo

const AdminProjectsPage = ({ userProfile, session }) => {
  const { client } = useSupabase();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  // --- MUDANÇA: Refs para os três inputs de arquivo ---
  const thumbnailInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const formElementStyle = {
    background: 'var(--secondary-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    color: 'var(--text-color)',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  const clearFileInput = (inputRef) => { if (inputRef.current) { inputRef.current.value = ""; } };

  // useEffect completo para buscar tanto projetos quanto categorias
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Erro ao buscar projetos:', error);
        setFormMessage('Não foi possível carregar os projetos existentes.');
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await client.from('categories').select('*');
      if (error) {
        console.error('Erro ao buscar categorias:', error);
      } else {
        setCategories(data || []);
      }
      setLoadingCategories(false);
    };

    fetchProjects();
    fetchCategories();
  }, [client]);

  const handleDelete = async (projectToDelete) => {
    const isConfirmed = window.confirm(`Tem certeza que deseja deletar o projeto "${projectToDelete.title || 'sem título'}"?`);
    if (!isConfirmed) return;
    const filesToRemove = [];
    if (projectToDelete.file_url) filesToRemove.push(projectToDelete.file_url.split('/portfolio-assets/')[1]);
    if (projectToDelete.image_url) filesToRemove.push(projectToDelete.image_url.split('/portfolio-assets/')[1]);
    if (filesToRemove.length > 0) {
      const { error: removeError } = await client.storage.from('portfolio-assets').remove(filesToRemove);
      if (removeError) {
        setFormMessage('Erro ao deletar os arquivos associados.');
        return;
      }
    }
    const { error: deleteError } = await client.from('projects').delete().match({ id: projectToDelete.id });
    if (deleteError) {
      setFormMessage('Erro ao deletar o projeto.');
    } else {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setFormMessage('Projeto deletado com sucesso!');
    }
  };

  const getFolderForExtension = (extension) => {
    const ext = extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'images';
    if (ext === 'pdf') return 'pdfs';
    if (['doc', 'docx'].includes(ext)) return 'docs';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheets';
    return 'others';
  };

  const sanitizeFilename = (filename) => {
    // Remove acentos e caracteres especiais, converte para minúsculas, troca espaços por hífens
    const sanitized = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-.]/g, '');
    return sanitized.replace(/-+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setFormMessage('');

    const finalCategoryId = selectedSubCategory || selectedCategory;
    if (!finalCategoryId) {
      setFormMessage({ type: 'error', text: 'Por favor, selecione uma categoria.' });
      setUploading(false);
      return;
    }
    const formData = new FormData(e.target);
    const file = formData.get('file');
    let fileUrl = null;
    let thumbnailUrl = null;
    let imageUrl = null;
    const thumbnailFile = formData.get('thumbnail');
    if (thumbnailFile && thumbnailFile.size > 0) {
      const sanitizedThumbName = sanitizeFilename(thumbnailFile.name);
      const thumbPath = `public/thumbnails/${Date.now()}-${sanitizedThumbName}`;
      const { error } = await client.storage.from('portfolio-assets').upload(thumbPath, thumbnailFile);
      if (error) { setFormMessage('Erro ao enviar thumbnail.'); setUploading(false); return; }
      thumbnailUrl = client.storage.from('portfolio-assets').getPublicUrl(thumbPath).data.publicUrl;
    }
    if (file && file.size > 0) {
      const sanitizedFileName = sanitizeFilename(file.name);
      const filePath = `public/files/${Date.now()}-${sanitizedFileName}`;
      const fileExt = file.name.split('.').pop();
      const folder = getFolderForExtension(fileExt);
      //const filePath = `${folder}/${Date.now()}.${fileExt}`;
      const { error } = await client.storage.from('portfolio-assets').upload(filePath, file);
      if (error) { setFormMessage('Erro ao enviar arquivo principal.'); setUploading(false); return; }
      fileUrl = client.storage.from('portfolio-assets').getPublicUrl(filePath).data.publicUrl;
    }
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      const sanitizedImageName = sanitizeFilename(imageFile.name);
      const imgPath = `public/main-images/${Date.now()}-${sanitizedImageName}`;
      const { error } = await client.storage.from('portfolio-assets').upload(imgPath, imageFile);
      if (error) { setFormMessage('Erro ao enviar imagem principal.'); setUploading(false); return; }
      imageUrl = client.storage.from('portfolio-assets').getPublicUrl(imgPath).data.publicUrl;
    }

    const { data: newProject, error } = await client.from('projects').insert([{
      user_id: session.user.id,
      title: formData.get('title'),
      excerpt: formData.get('excerpt'),
      description: formData.get('description'),
      category_id: finalCategoryId,
      thumbnail_url: thumbnailUrl,
      image_url: imageUrl,
      file_url: fileUrl,
    }]).select('*, creator:profiles(full_name), category:categories(name, parent:categories(name))');

    if (error) {
      setFormMessage('Erro ao salvar no banco de dados: ' + error.message);
    } else {
      setFormMessage('Projeto adicionado com sucesso!');
      e.target.reset();
      setSelectedCategory('');
      setSelectedSubCategory('');
      clearFileInput(thumbnailInputRef);
      clearFileInput(imageInputRef);
      clearFileInput(fileInputRef);
      setProjects([newProject[0], ...projects]);
    }
    setUploading(false);
  };

  const handleLogout = async () => { await client.auth.signOut(); };

  const projectListStyle = { listStyle: 'none', padding: 0 };
  const projectItemStyle = { background: '#1b1b32', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
  const deleteButtonStyle = { backgroundColor: 'var(--error-color)', color: 'white', padding: '8px 12px', fontSize: '0.9rem', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  const clearButtonStyle = { padding: '6px 10px', fontSize: '0.8rem', background: '#3b3b4f', border: '1px solid var(--border-color)', color: 'var(--subtle-text-color)', borderRadius: '5px', cursor: 'pointer' };

  const parentCategories = categories.filter(c => c.parent_id === null);
  const subCategories = selectedCategory
    ? categories.filter(c => c.parent_id === parseInt(selectedCategory, 10))
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--accent-color)', margin: 0, borderBottom: 'none' }}>Gerenciar Projetos</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '600px', margin: '0 auto' }}>
        <input name="title" type="text" placeholder="Título do Projeto" style={formElementStyle} required />
        <textarea name="excerpt" placeholder="Resumo do projeto" rows={3} style={formElementStyle} required></textarea>
        <textarea name="description" placeholder="Descrição completa do projeto" rows={8} style={{ ...formElementStyle, resize: 'vertical' }} required></textarea>

        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }} required style={formElementStyle}>
          <option value="">-- Selecione uma Categoria --</option>
          {parentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>

        {selectedCategory && subCategories.length > 0 && (
          <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} style={formElementStyle}>
            <option value="">-- Selecione uma Subcategoria (opcional) --</option>
            {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        )}
        <div style={{ ...formElementStyle, border: 'none', background: 'none' }}>
          <label>Imagem (Thumbnail):</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <input ref={thumbnailInputRef} name="thumbnail" type="file" accept="image/*" style={{ flexGrow: 1 }} />
            <button type="button" onClick={() => clearFileInput(thumbnailInputRef)} style={clearButtonStyle}>Remover</button>
          </div>
        </div>
        <div style={{ ...formElementStyle, border: 'none', background: 'none' }}>
          <label>Arquivo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <input ref={fileInputRef} name="file" type="file" style={{ flexGrow: 1 }} />
            <button type="button" onClick={() => clearFileInput(fileInputRef)} style={clearButtonStyle}>Remover</button>
          </div>
        </div>
        <div style={{ ...formElementStyle, border: 'none', background: 'none' }}>
          <label>Imagem</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <input ref={imageInputRef} name="image" type="file" accept="image/*" style={{ flexGrow: 1 }} />
            <button type="button" onClick={() => clearFileInput(imageInputRef)} style={clearButtonStyle}>Remover</button>
          </div>
        </div>
        <button type="submit" disabled={uploading} style={{ marginTop: '1rem' }}>{uploading ? 'Enviando...' : 'Salvar Projeto'}</button>
      </form>

      {formMessage && <p style={{ textAlign: 'center', color: formMessage.includes('sucesso') ? 'var(--success-color)' : 'var(--error-color)' }}>{formMessage.text || formMessage}</p>}

      {userProfile && userProfile.role === 'admin' && (
        <div style={{ maxWidth: '600px', margin: '3rem auto 0 auto' }}>
          <h3 style={{ textAlign: 'center' }}>Projetos Existentes</h3>
          {loading ? <p>Carregando projetos...</p> : (
            <ul style={projectListStyle}>
              {projects.length > 0 ? projects.map(p => (
                <li key={p.id} style={projectItemStyle}>
                  <span>{p.title || 'Projeto sem título'} <small>({new Date(p.created_at).toLocaleDateString()})</small></span>
                  <button onClick={() => handleDelete(p)} style={deleteButtonStyle}>Deletar</button>
                </li>
              )) : <p style={{ textAlign: 'center' }}>Nenhum projeto encontrado.</p>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ResizableImageComponent = props => {
  const { node, updateAttributes, selected } = props;

  const wrapperStyle = {
    display: 'inline-block', // Essencial para o comportamento "in line"
    position: 'relative',
    // --- MUDANÇA AQUI: Alinhamento vertical ---
    verticalAlign: 'middle', // Alinha a imagem com o meio do texto
    outline: selected ? '2px solid var(--accent-color)' : '2px solid transparent',
  };

  return (
    <NodeViewWrapper as="span" style={wrapperStyle} contentEditable="false">
      <Rnd
        disableDragging={true}
        lockAspectRatio={true}
        default={{
          x: 0,
          y: 0,
          width: node.attrs.width,
        }}
        minWidth={30}
        minHeight={30}
        style={{ cursor: 'default' }}
        onResizeStop={(e, direction, ref) => {
          updateAttributes({
            width: parseInt(ref.style.width, 10),
          });
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          draggable="false"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Rnd>
    </NodeViewWrapper>
  );
};

const CustomImageExtension = Image.extend({
  inline: true,
  group: 'inline',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: 'auto' },
      height: { default: 'auto' },
      'data-align': { default: 'inline' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('src'),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
          alt: dom.getAttribute('alt'),
          title: dom.getAttribute('title'),
          'data-align': dom.getAttribute('data-align'),
        }),
      },
    ];
  },
});


// --- Componente da Barra de Ferramentas do Editor ---

const MenuBar = ({ editor }) => {
  const { client } = useSupabase();
  const fileInputRef = useRef(null);

  if (!editor) { return null; }

  const addImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileName = `<span class="math-inline">\{Date\.now\(\)\}\-</span>{file.name}`;
    const filePath = `public/${fileName}`;
    const { error: uploadError } = await client.storage.from('content-images').upload(filePath, file);
    if (uploadError) { alert('Erro ao enviar imagem: ' + uploadError.message); return; }
    const { data: urlData } = client.storage.from('content-images').getPublicUrl(filePath);
    if (urlData?.publicUrl) {
      editor.chain().focus().insertContent({
        type: 'image',
        attrs: { src: urlData.publicUrl, alt: file.name },
      }).run();
    } else {
      alert('Não foi possível obter a URL pública da imagem.');
    }
  };

  const menuButtonStyle = { background: '#333', color: 'white', marginRight: '5px', marginBottom: '10px', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' };
  const menuButtonActiveStyle = { ...menuButtonStyle, background: 'var(--accent-color)', color: 'black' };

  return (
    <div className="menu-bar" style={{ border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px 8px 0 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={editor.isActive('bold') ? menuButtonActiveStyle : menuButtonStyle}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={editor.isActive('italic') ? menuButtonActiveStyle : menuButtonStyle}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} style={menuButtonStyle}>Paragraph</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={menuButtonStyle}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={menuButtonStyle}>H2</button>
      <button type="button" onClick={() => fileInputRef.current.click()} style={menuButtonStyle}>Inserir Imagem</button>
      <input type="file" ref={fileInputRef} onChange={addImage} style={{ display: 'none' }} accept="image/*" />

      {editor.isActive('image') && (
        <div style={{ borderLeft: '2px solid var(--border-color)', marginLeft: '10px', paddingLeft: '10px', display: 'flex', gap: '5px' }}>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'inline' }).run()} style={menuButtonStyle}>In-line</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'left' }).run()} style={menuButtonStyle}>Float Left</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'right' }).run()} style={menuButtonStyle}>Float Right</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '150px' }).run()} style={{ ...menuButtonStyle, marginLeft: '10px' }}>P</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '300px' }).run()} style={menuButtonStyle}>M</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '500px' }).run()} style={menuButtonStyle}>G</button>
        </div>
      )}
    </div>
  );
};

// --- O componente do editor principal ---
const TiptapEditor = ({ content, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImageExtension,
      Placeholder.configure({
        placeholder: 'Comece a escrever aqui...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'background: var(--primary-color); color: var(--text-color); border: 1px solid var(--border-color); border-top: none; padding: 1rem; min-height: 400px; border-radius: 0 0 8px 8px; outline: none;',
      },
    },
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

// --- A página de administração de conteúdo ---

const AdminContentPage = ({ userProfile, session }) => {
  const { client } = useSupabase();

  // States do formulário
  const [editingPostId, setEditingPostId] = useState(null);
  const [series, setSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [title, setTitle] = useState('');
  const [partNumber, setPartNumber] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [publishAt, setPublishAt] = useState('');
  const [content, setContent] = useState('');
  const [dateInputKey, setDateInputKey] = useState(Date.now());
  const [editorKey, setEditorKey] = useState(1);

  // States de controle
  const [posts, setPosts] = useState([]);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'scheduled', 'draft'

  useEffect(() => {
    if (!client) return;

    const fetchSeries = async () => {
      const { data, error } = await client.from('content_series').select('*');
      if (error) { console.error("Erro ao buscar as séries:", error); }
      else if (data) { setSeries(data); }
    };

    const fetchPosts = async () => {
      const { data, error } = await client.from('content_posts').select('id, title, is_published, publish_at').order('created_at', { ascending: false });
      if (error) { console.error("Erro ao buscar os posts:", error); }
      else if (data) { setPosts(data); }
    }

    fetchSeries();
    fetchPosts();
  }, [client]);

  const resetForm = () => {
    setEditingPostId(null);
    setTitle('');
    setIsPublished(false);
    setSelectedSeriesId('');
    setContent('');
    setPartNumber(1);
    setPublishAt('');
    setEditorKey(prevKey => prevKey + 1);
    setDateInputKey(Date.now());
    setFormMessage({ type: '', text: '' });
  };

  const handleEdit = async (postId) => {
    const { data: postToEdit, error } = await client
      .from('content_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      alert("Erro ao carregar o post para edição.");
      return;
    }

    setEditingPostId(postToEdit.id);
    setTitle(postToEdit.title);
    setSelectedSeriesId(postToEdit.series_id);
    setPartNumber(postToEdit.part_number);
    setIsPublished(postToEdit.is_published);
    setContent(postToEdit.content);

    if (postToEdit.publish_at) {
      const date = new Date(postToEdit.publish_at);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      setPublishAt(formattedDate);
    } else {
      setPublishAt('');
    }

    setEditorKey(prevKey => prevKey + 1);
    window.scrollTo(0, 0);
  }

  const handleSavePost = async () => {
    if (!selectedSeriesId || !title) {
      setFormMessage({ type: 'error', text: 'Série e Título são obrigatórios.' });
      return;
    }
    if (!isPublished && !publishAt) {
      setFormMessage({ type: 'error', text: 'Marque "Publicar imediatamente" ou defina uma data para agendamento.' });
      return;
    }
    console.log("PublishAt:", publishAt);
    // 1. Converte a data local para o formato UTC que o banco de dados entende
    const utcPublishAt = publishAt ? new Date(publishAt).toISOString() : null;

    // 2. Monta o objeto de dados incluindo o 'publish_at'
    const postData = {
      title,
      content,
      series_id: selectedSeriesId,
      part_number: partNumber,
      is_published: isPublished,
      publish_at: utcPublishAt, // <-- GARANTE QUE A DATA SEJA INCLUÍDA
      user_id: session.user.id,
    };

    let error;
    if (editingPostId) {
      // ATUALIZAR post existente
      const { error: updateError } = await client.from('content_posts').update(postData).eq('id', editingPostId);
      error = updateError;
    } else {
      // INSERIR novo post
      const { error: insertError } = await client.from('content_posts').insert(postData);
      error = insertError;
    }

    if (error) {
      setFormMessage({ type: 'error', text: 'Falha ao salvar: ' + error.message });
    } else {
      setFormMessage({ type: 'success', text: 'Post salvo com sucesso!' });
      resetForm();
      // Recarrega a lista de posts para mostrar o novo/atualizado
      const { data } = await client
      .from('content_posts')
      .select('id, title, is_published, publish_at')
      .order('created_at', { ascending: false });
      if (data) setPosts(data);
    }
  };

  const getStatus = (post) => {
    if (post.is_published) return <span style={{ color: 'var(--success-color)' }}>Publicado</span>;
    if (post.publish_at && new Date(post.publish_at) > new Date()) return <span style={{ color: '#f0ad4e' }}>Agendado para {new Date(post.publish_at).toLocaleDateString()}</span>;
    if (post.publish_at && new Date(post.publish_at) <= new Date()) return <span style={{ color: 'var(--success-color)' }}>Publicado (via agendamento)</span>;
    return <span style={{ color: 'var(--subtle-text-color)' }}>Rascunho</span>
  }

  const filteredPosts = posts.filter(post => {
    if (statusFilter === 'all') {
      return true;
    }
    const now = new Date();
    const publishDate = post.publish_at ? new Date(post.publish_at) : null;

    const isCurrentlyPublished = post.is_published || (publishDate && publishDate <= now);
    const isScheduled = !post.is_published && (publishDate && publishDate > now);
    const isDraft = !post.is_published && !publishDate;

    if (statusFilter === 'published') return isCurrentlyPublished;
    if (statusFilter === 'scheduled') return isScheduled;
    if (statusFilter === 'draft') return isDraft;

    return true;
  });

  const filterContainerStyle = { display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' };
  const filterButtonStyle = (isActive) => ({
    background: isActive ? 'var(--accent-color)' : 'var(--secondary-color)',
    color: isActive ? 'var(--primary-color)' : 'var(--subtle-text-color)',
    border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  return (
    <div>
      <h2 style={{ borderBottom: 'none' }}>{editingPostId ? 'Editando Post' : 'Criar Novo Post'}</h2>
      {editingPostId && <button onClick={resetForm} style={{ marginBottom: '1rem' }}>+ Criar Novo Post</button>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--secondary-color)', padding: '2rem', borderRadius: '8px' }}>
        <select value={selectedSeriesId} onChange={(e) => setSelectedSeriesId(e.target.value)} required>
          <option value="" disabled>Selecione uma Série/Tema</option>
          {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <input type="text" placeholder="Título da Aula/Post" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="number" placeholder="Número da Parte" value={partNumber} onChange={(e) => setPartNumber(Number(e.target.value))} required />

        <TiptapEditor key={editorKey} content={content} onContentChange={setContent} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <label><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Publicar imediatamente?</label>
          <label>Agendar para: <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></label>
        </div>

        <button onClick={handleSavePost}>Salvar Post</button>
        {formMessage.text && (<p style={{ color: `var(--${formMessage.type}-color)`, textAlign: 'center' }}>{formMessage.text}</p>)}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ textAlign: 'center' }}>Seus Posts</h3>
        <div style={filterContainerStyle}>
          <button onClick={() => setStatusFilter('all')} style={filterButtonStyle(statusFilter === 'all')}>Todos</button>
          <button onClick={() => setStatusFilter('published')} style={filterButtonStyle(statusFilter === 'published')}>Publicados</button>
          <button onClick={() => setStatusFilter('scheduled')} style={filterButtonStyle(statusFilter === 'scheduled')}>Agendados</button>
          <button onClick={() => setStatusFilter('draft')} style={filterButtonStyle(statusFilter === 'draft')}>Rascunhos</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredPosts.map(post => (
            <li key={post.id} style={{ background: 'var(--secondary-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-color)', fontWeight: 'bold' }}>{post.title}</p>
                <small>{getStatus(post)}</small>
              </div>
              <button onClick={() => handleEdit(post.id)}>Editar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
// Substitua seu AdminDashboardPage por este código atualizado

const AdminDashboardPage = ({ setPage, userProfile }) => {
  const dashboardStyle = {
    textAlign: 'center'
  };
  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '2rem'
  };

  return (
    <div style={dashboardStyle}>
      <h2>Painel de Controle</h2>
      <p>Selecione a área que você deseja gerenciar.</p>
      <div style={buttonContainerStyle}>
        {/* Este botão aparece para todos os usuários logados */}
        <button onClick={() => setPage('admin-projects')}>
          Gerenciar Projetos
        </button>

        {/* --- MUDANÇA AQUI --- */}
        {/* Este botão só aparece se a role do usuário for 'admin' */}
        {userProfile && userProfile.role === 'admin' && (
          <button onClick={() => setPage('admin-content')}>
            Gerenciar Conteúdo
          </button>
        )}
      </div>
    </div>
  );
};

// --- Authication Page ---

const AuthPage = ({ setPage }) => {
  const { client } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    let loginEmail = identifier;

    // Se o identificador não for um e-mail, chama a FUNÇÃO DE BANCO DE DADOS
    if (!identifier.includes('@')) {
      setMessage('Buscando e-mail pelo nome de usuário...');
      try {
        // --- MUDANÇA PRINCIPAL AQUI ---
        // Chamando a função RPC em vez da Edge Function
        const { data, error } = await client.rpc('get_email_by_username', {
          p_username: identifier // O nome do parâmetro deve ser igual ao da função SQL
        });

        if (error || !data) {
          throw new Error('Usuário não encontrado.');
        }

        // A resposta (data) já é o e-mail que queremos
        loginEmail = data;

      } catch (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    // Tenta o login com o e-mail
    setMessage('Autenticando...');
    const { error: signInError } = await client.auth.signInWithPassword({
      email: loginEmail,
      password: password
    });

    if (signInError) {
      setMessage("Falha no login. Verifique suas credenciais.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <input
          type="text"
          placeholder="Usuário ou email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? message : 'Entrar'}
        </button>
        {!loading && message && <p style={{ color: 'var(--error-color)', textAlign: 'center' }}>{message}</p>}

        <p style={{ textAlign: 'center', color: 'var(--subtle-text-color)', marginTop: '1rem' }}>
          Não tem uma conta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }} style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
            Registre-se
          </a>
        </p>
      </form>
    </div>
  );
};
// --- Register Page ---

const RegisterPage = ({ setPage }) => {
  const { client } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      setPage('registration-success');
    }
  };

  const messageStyle = {
    textAlign: 'center',
    color: 'var(--error-color)'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Criar Conta</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <input type="text" placeholder=" supabase loginUsuario" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {/* --- CORREÇÃO AQUI --- */}
        <input type="password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {message.text && <p style={messageStyle}>{message.text}</p>}
        <p style={{ textAlign: 'center', color: 'var(--subtle-text-color)', marginTop: '1rem' }}>
          Já tem uma conta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('admin'); }} style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
            Faça login
          </a>
        </p>
      </form>
    </div>
  );
};

const RegistrationSuccessPage = ({ setPage }) => {
  const containerStyle = {
    maxWidth: '600px',
    margin: '8rem auto',
    padding: '2rem',
    textAlign: 'center',
    background: 'var(--secondary-color)',
    borderRadius: '8px',
    borderLeft: '5px solid var(--accent-color)'
  };

  const h2Style = {
    color: 'var(--accent-color)',
    marginBottom: '1.5rem'
  };

  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>Cadastro Realizado com Sucesso!</h2>
      <p style={{ color: 'var(--text-color)', lineHeight: 1.6 }}>
        Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta antes de fazer o login.
      </p>
      <button
        onClick={() => setPage('admin')}
        style={{ marginTop: '2rem' }}
      >
        Voltar para a Página de Login
      </button>
    </div>
  );
};

const ProfilePage = ({ userProfile, session, onProfileUpdate, onNavigateToPost }) => {
  const { client } = useSupabase();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session) return;
      setLoading(true);
      const { data, error } = await client
        .from('user_post_favorites')
        .select('content_posts(*,series: content_series(title),creator: profiles!user_id(full_name))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Erro ao buscar favoritos:", error);
      } else if (data) {
        setFavorites(data);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [client, session]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    // 1. Atualizar o nome (na tabela profiles)
    const { error: profileError } = await client
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', session.user.id);

    if (profileError) {
      setMessage({ type: 'error', text: 'Erro ao atualizar o nome: ' + profileError.message });
      setLoading(false);
      return;
    }

    // 2. Atualizar a senha (na tabela auth), se preenchida
    if (password) {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' });
        setLoading(false);
        return;
      }
      const { error: authError } = await client.auth.updateUser({ password: password });
      if (authError) {
        setMessage({ type: 'error', text: 'Erro ao atualizar a senha: ' + authError.message });
        setLoading(false);
        return;
      }
    }

    setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    onProfileUpdate(); // Avisa o App para recarregar o perfil
    setIsEditing(false); // Sai do modo de edição
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ borderBottom: 'none' }}>Seu Perfil</h2>
      {isEditing ? (
        // MODO DE EDIÇÃO
        <form onSubmit={handleProfileUpdate} style={{ background: 'var(--secondary-color)', padding: '2rem', borderRadius: '8px', maxWidth: '600px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Nome Completo</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Nova Senha (deixe em branco para não alterar)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Confirmar Nova Senha</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <div>
            <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ marginLeft: '1rem', background: 'var(--subtle-text-color)' }}>Cancelar</button>
          </div>
          {message.text && <p style={{ color: `var(--${message.type}-color)`, marginTop: '1rem' }}>{message.text}</p>}
        </form>
      ) : (
        // MODO DE VISUALIZAÇÃO
        <div style={{ background: 'var(--secondary-color)', padding: '2rem', borderRadius: '8px', maxWidth: '600px' }}>
          <p><strong>Nome:</strong> {userProfile?.full_name}</p>
          <p><strong>Email:</strong> {session?.user.email}</p>
          <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
          {message.text && message.type === 'success' && <p style={{ color: `var(--success-color)`, marginTop: '1rem' }}>{message.text}</p>}
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3>Meus Favoritos</h3>
        {loading ? <p>Carregando...</p> : (
          favorites.length > 0 ? (
            favorites.map(({ content_posts: post }) => (
              post &&
              <div
                key={post.id}
                style={{ background: 'var(--secondary-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}
                onClick={() => onNavigateToPost(post)}
              >
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-color)' }}>{post.title}</p>
                <small>Da série: {post.series?.title}</small>
              </div>
            ))
          ) : <p>Você ainda não favoritou nenhum post.</p>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const { client, loading: supabaseLoading } = useSupabase();
  const [page, setPage] = useState('home');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [postToView, setPostToView] = useState(null);

  const [contentPageKey, setContentPageKey] = useState(Date.now());

  const fetchProfile = useCallback(async () => {
    if (!client || !session) {
      setProfile(null);
      return;
    }
    const { data } = await client
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single();
    setProfile(data || null);
  }, [client, session]);

  const navigateToPost = useCallback((post) => {
    setPostToView(post);
    setPage('content');
  }, []);

  const onPostViewed = useCallback(() => {
    setPostToView(null);
  }, []);

  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    fetchProfile();
  }, [session, client, fetchProfile]);

  if (supabaseLoading) {
    return (<div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Carregando Aplicação...</h2></div>);
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} />;
      case 'about': return <AboutPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'content': return <ContentPage key={contentPageKey} session={session} initialPost={postToView} onPostViewed={onPostViewed} />;
      case 'contact': return <ContactPage />;
      case 'register': return <RegisterPage setPage={setPage} />;
      case 'registration-success': return <RegistrationSuccessPage setPage={setPage} />;
      case 'profile': return session ? <ProfilePage userProfile={profile} session={session} onProfileUpdate={fetchProfile} onNavigateToPost={navigateToPost} /> : <HomePage setPage={setPage} />;
      case 'admin': return session ? <AdminDashboardPage setPage={setPage} userProfile={profile} /> : <AuthPage setPage={setPage} />;
      case 'admin-projects': return session ? <AdminProjectsPage userProfile={profile} session={session} /> : <AuthPage setPage={setPage} />;
      case 'admin-content': return session ? <AdminContentPage userProfile={profile} session={session} /> : <AuthPage setPage={setPage} />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <Navbar
          setPage={setPage}
          session={session}
          profile={profile}
          onContentLinkClick={() => setContentPageKey(Date.now())} 
        />
        <main className={`main-content ${page === 'home' ? 'main-content-home' : ''}`}>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </>
  );
}

const AppWrapper = () => (<SupabaseProvider><App /></SupabaseProvider>);
export default AppWrapper;
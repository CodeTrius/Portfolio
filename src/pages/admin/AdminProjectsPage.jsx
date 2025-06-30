import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../context/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import { Link } from 'react-router-dom';

const AdminProjectsPage = () => {
  const { client } = useSupabase();
  const { session } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const thumbnailInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!client) return;
    setLoading(true);

    const fetchProjects = async () => {
      const { data, error } = await client
        .from('projects')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        setFormMessage({ type: 'error', text: 'Não foi possível carregar os projetos existentes.' });
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

  const sanitizeFilename = (filename) => {
    return filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-.]/g, '');
  };

  const clearFileInput = (inputRef) => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDelete = async (projectToDelete) => {
    if (!window.confirm(`Tem certeza que deseja deletar o projeto "${projectToDelete.title}"?`)) return;

    // Lógica para deletar arquivos do storage (opcional, mas recomendado)
    // ...

    const { error } = await client.from('projects').delete().match({ id: projectToDelete.id });

    if (error) {
      setFormMessage({ type: 'error', text: 'Erro ao deletar o projeto.' });
    } else {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setFormMessage({ type: 'success', text: 'Projeto deletado com sucesso!' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setFormMessage({ type: '', text: '' });

    const finalCategoryId = selectedSubCategory || selectedCategory;
    if (!finalCategoryId) {
      setFormMessage({ type: 'error', text: 'Por favor, selecione uma categoria.' });
      setUploading(false);
      return;
    }

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const description = formData.get('description');

    let fileUrl = null;
    let thumbnailUrl = null;
    let imageUrl = null;

    try {
      const thumbnailFile = thumbnailInputRef.current?.files[0];
      if (thumbnailFile) {
        const thumbPath = `public/thumbnails/${Date.now()}-${sanitizeFilename(thumbnailFile.name)}`;
        const { error } = await client.storage.from('portfolio-assets').upload(thumbPath, thumbnailFile);
        if (error) throw new Error('Erro no upload da thumbnail: ' + error.message);
        thumbnailUrl = client.storage.from('portfolio-assets').getPublicUrl(thumbPath).data.publicUrl;
      }

      const mainImageFile = imageInputRef.current?.files[0];
      if (mainImageFile) {
        const imgPath = `public/main-images/${Date.now()}-${sanitizeFilename(mainImageFile.name)}`;
        const { error } = await client.storage.from('portfolio-assets').upload(imgPath, mainImageFile);
        if (error) throw new Error('Erro no upload da imagem principal: ' + error.message);
        imageUrl = client.storage.from('portfolio-assets').getPublicUrl(imgPath).data.publicUrl;
      }

      const mainFile = fileInputRef.current?.files[0];
      if (mainFile) {
        const filePath = `public/files/${Date.now()}-${sanitizeFilename(mainFile.name)}`;
        const { error } = await client.storage.from('portfolio-assets').upload(filePath, mainFile);
        if (error) throw new Error('Erro no upload do arquivo principal: ' + error.message);
        fileUrl = client.storage.from('portfolio-assets').getPublicUrl(filePath).data.publicUrl;
      }

      const { data: newProject, error: insertError } = await client.from('projects').insert([{
        user_id: session.user.id,
        title,
        excerpt,
        description,
        category_id: finalCategoryId,
        thumbnail_url: thumbnailUrl,
        image_url: imageUrl,
        file_url: fileUrl,
      }]).select().single();

      if (insertError) throw new Error('Erro ao salvar no banco de dados: ' + insertError.message);

      setFormMessage({ type: 'success', text: 'Projeto adicionado com sucesso!' });
      e.target.reset();
      setSelectedCategory('');
      setSelectedSubCategory('');
      clearFileInput(thumbnailInputRef);
      clearFileInput(imageInputRef);
      clearFileInput(fileInputRef);
      setProjects([newProject, ...projects]);

    } catch (error) {
      setFormMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const parentCategories = categories.filter(c => c.parent_id === null);
  const subCategories = selectedCategory ? categories.filter(c => c.parent_id === parseInt(selectedCategory, 10)) : [];

  if (loading || loadingCategories) return <Loading />;

  return (

    <div>
      
      <Link to="/admin" className="back-button3">
        &larr; Voltar para a Admin
      </Link>
      <Link to="/admin" className="back-button2">
        &larr; Voltar para a Admin
      </Link>
      <div className="admin-page-header">
        <h2>Gerenciar Projetos</h2>
      </div>
      <form onSubmit={handleSubmit} className="admin-form" style={{ gap: '1rem', background: 'var(--secondary-color)', borderRadius: '8px', padding: '2rem', maxWidth: '800px' }}>
        <input name="title" type="text" placeholder="Título do Projeto" required />
        <textarea name="excerpt" placeholder="Resumo do projeto" rows={3} required></textarea>
        <textarea name="description" placeholder="Descrição completa do projeto" rows={8} required></textarea>

        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }} required>
          <option value="">-- Selecione uma Categoria Principal --</option>
          {parentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>

        {selectedCategory && subCategories.length > 0 && (
          <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
            <option value="">-- Selecione uma Subcategoria (opcional) --</option>
            {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        )}

        <div className="input-group">
          <label>Imagem de Miniatura (Thumbnail):</label>
          <div className="file-input-wrapper">
            <input ref={thumbnailInputRef} name="thumbnail" type="file" accept="image/*" />
            <button type="button" onClick={() => clearFileInput(thumbnailInputRef)} className="clear-file-button">Limpar</button>
          </div>
        </div>
        <div className="input-group">
          <label>Imagem Principal (para a página de detalhes):</label>
          <div className="file-input-wrapper">
            <input ref={imageInputRef} name="image" type="file" accept="image/*" />
            <button type="button" onClick={() => clearFileInput(imageInputRef)} className="clear-file-button">Limpar</button>
          </div>
        </div>
        <div className="input-group">
          <label>Arquivo Principal (PDF, ZIP, etc.):</label>
          <div className="file-input-wrapper">
            <input ref={fileInputRef} name="file" type="file" />
            <button type="button" onClick={() => clearFileInput(fileInputRef)} className="clear-file-button">Limpar</button>
          </div>
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Enviando...' : 'Salvar Projeto'}
        </button>
      </form>

      {formMessage.text && <p className={`admin-form-message ${formMessage.type}`}>{formMessage.text}</p>}

      <div className="admin-list-container">
        <h3>Projetos Existentes</h3>
        <ul className="admin-list">
          {projects.length > 0 ? projects.map(p => (
            <li key={p.id} className="admin-list-item">
              <span>{p.title || 'Projeto sem título'} <small>({new Date(p.created_at).toLocaleDateString()})</small></span>
              <button onClick={() => handleDelete(p)} className="delete-button">Deletar</button>
            </li>
          )) : <p style={{ textAlign: 'center' }}>Nenhum projeto encontrado.</p>}
        </ul>
      </div>
    </div>
  );
};

export default AdminProjectsPage;
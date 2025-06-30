import React, { useRef } from 'react';
import { useSupabase } from '../../context/SupabaseContext';

const MenuBar = ({ editor }) => {
  const { client } = useSupabase();
  const fileInputRef = useRef(null);

  if (!editor) {
    return null;
  }

  const addImage = async (event) => {
    if (!client) {
      alert('Cliente Supabase não está disponível.');
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const sanitizedName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-.]/g, '');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await client.storage.from('content-images').upload(filePath, file);

    if (uploadError) {
      alert('Erro ao enviar imagem: ' + uploadError.message);
      return;
    }

    const { data: urlData } = client.storage.from('content-images').getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      editor.chain().focus().setImage({ src: urlData.publicUrl, alt: file.name }).run();
    } else {
      alert('Não foi possível obter a URL pública da imagem.');
    }
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('URL do Vídeo do YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  return (
    <div className="menu-bar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`menu-button ${editor.isActive('bold') ? 'active' : ''}`}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`menu-button ${editor.isActive('italic') ? 'active' : ''}`}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`menu-button ${editor.isActive('strike') ? 'active' : ''}`}>Strike</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`menu-button ${editor.isActive('paragraph') ? 'active' : ''}`}>Paragraph</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`menu-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`menu-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`menu-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}>H3</button>
      <button type="button" onClick={() => fileInputRef.current.click()} className="menu-button">Inserir Imagem</button>
      <input type="file" ref={fileInputRef} onChange={addImage} style={{ display: 'none' }} accept="image/*" />
      <button type="button" onClick={addYoutubeVideo} className="menu-button">Adicionar Vídeo</button>

      <div className="menu-bar-divider">
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="menu-button">Tabela</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="menu-button">Add Col Antes</button>
        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="menu-button">Del Tabela</button>
      </div>
      {editor.isActive('image') && (
        <div className="menu-bar-divider">
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '200px' }).run()} className="menu-button">P</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '350px' }).run()} className="menu-button">M</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '500px' }).run()} className="menu-button">G</button>
          <button type="button" onClick={() => editor.chain().focus().updateAttributes('image', { width: '700px' }).run()} className="menu-button">GG</button>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
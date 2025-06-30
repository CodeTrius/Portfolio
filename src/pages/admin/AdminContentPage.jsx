import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../context/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import TiptapEditor from '../../components/editor/TiptapEditor';
import Loading from '../../components/common/Loading';
import { Link } from 'react-router-dom';

const AdminContentPage = () => {
    const { client } = useSupabase();
    const { session } = useAuth();

    // States do formulário principal
    const [editingPostId, setEditingPostId] = useState(null);
    const [title, setTitle] = useState('');
    const [partNumber, setPartNumber] = useState(1);
    const [isPublished, setIsPublished] = useState(true);
    const [publishAt, setPublishAt] = useState('');
    const [content, setContent] = useState('');
    const [editorKey, setEditorKey] = useState(1);

    // States para as categorias
    const [contentCategories, setContentCategories] = useState([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [showNewParentInput, setShowNewParentInput] = useState(false);
    const [newParentCatName, setNewParentCatName] = useState('');
    const [showNewSubInput, setShowNewSubInput] = useState(false);
    const [newSubCatName, setNewSubCatName] = useState('');

    // States de controle e lista de posts
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('Todos');

    // Refs e states para uploads
    const docFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null);
    const [docDisplayName, setDocDisplayName] = useState('');
    const [videoDisplayName, setVideoDisplayName] = useState('');

    // State para o quiz
    const [quizQuestions, setQuizQuestions] = useState([]);

    useEffect(() => {
        if (!client) return;
        setLoading(true);
        const fetchInitialData = async () => {
            const catPromise = client.from('content_categories').select('*').order('name');
            const postsPromise = client.from('content_posts').select('id, title, is_published, publish_at, created_at').order('created_at', { ascending: false });

            const [catResult, postsResult] = await Promise.all([catPromise, postsPromise]);

            if (catResult.error) setFormMessage({ type: 'error', text: 'Falha ao carregar categorias.' });
            else setContentCategories(catResult.data || []);

            if (postsResult.error) setFormMessage({ type: 'error', text: 'Falha ao carregar posts.' });
            else setPosts(postsResult.data || []);

            setLoading(false);
        };
        fetchInitialData();
    }, [client]);

    useEffect(() => {
        const finalCategoryId = selectedSubCategory || selectedParentCategory;
        if (finalCategoryId && !editingPostId && client) {
            const fetchNextPartNumber = async (categoryId) => {
                const { count, error } = await client.from('content_posts').select('id', { count: 'exact', head: true }).eq('category_id', categoryId);
                if (error) { console.error("Erro ao buscar contagem de posts:", error); setPartNumber(1); }
                else { setPartNumber((count || 0) + 1); }
            };
            fetchNextPartNumber(finalCategoryId);
        }
    }, [selectedParentCategory, selectedSubCategory, editingPostId, client]);

    const handleQuizChange = (qIndex, field, value) => { const newQuestions = [...quizQuestions]; newQuestions[qIndex][field] = value; setQuizQuestions(newQuestions); };
    const handleQuizImageChange = (qIndex, file) => { if (!file) return; const newQuestions = [...quizQuestions]; newQuestions[qIndex].newImageFile = file; newQuestions[qIndex].imagePreviewUrl = URL.createObjectURL(file); setQuizQuestions(newQuestions); };
    const handleOptionChange = (qIndex, oIndex, field, value) => { const newQuestions = [...quizQuestions]; if (field === 'is_correct') { newQuestions[qIndex].options.forEach((opt, i) => opt.is_correct = i === oIndex); } else { newQuestions[qIndex].options[oIndex][field] = value; } setQuizQuestions(newQuestions); };
    const addQuestion = () => { setQuizQuestions([...quizQuestions, { question_text: '', options: [{ option_text: '', is_correct: true }], imageUrl: null, newImageFile: null, imagePreviewUrl: null }]); };
    const removeQuestion = (qIndex) => { setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex)); };
    const addOption = (qIndex) => { const newQuestions = [...quizQuestions]; newQuestions[qIndex].options.push({ option_text: '', is_correct: false }); setQuizQuestions(newQuestions); };
    const removeOption = (qIndex, oIndex) => { const newQuestions = [...quizQuestions]; newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex); setQuizQuestions(newQuestions); };

    const handleSaveNewParentCategory = async () => {
        if (!newParentCatName.trim() || !client) return;
        const { data: newCategory, error } = await client.from('content_categories').insert({ name: newParentCatName, parent_id: null }).select().single();
        if (error) {
            setFormMessage({ type: 'error', text: 'Erro ao criar categoria: ' + error.message });
        } else {
            setContentCategories([...contentCategories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedParentCategory(newCategory.id);
            setShowNewParentInput(false);
            setNewParentCatName('');
        }
    };

    const handleSaveNewSubCategory = async () => {
        if (!newSubCatName.trim() || !selectedParentCategory || !client) return;
        const { data: newCategory, error } = await client.from('content_categories').insert({ name: newSubCatName, parent_id: selectedParentCategory }).select().single();
        if (error) {
            setFormMessage({ type: 'error', text: 'Erro ao criar subcategoria: ' + error.message });
        } else {
            setContentCategories([...contentCategories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedSubCategory(newCategory.id);
            setShowNewSubInput(false);
            setNewSubCatName('');
        }
    };

    const getPostStatus = (post) => { const now = new Date(); if (post.is_published && (!post.publish_at || new Date(post.publish_at) <= now)) return 'Publicado'; if (post.publish_at && new Date(post.publish_at) > now) return 'Agendado'; return 'Rascunho'; };

    const resetForm = () => {
        setEditingPostId(null); setTitle(''); setIsPublished(true);
        setSelectedParentCategory(''); setSelectedSubCategory('');
        setContent(''); setPartNumber(1); setPublishAt('');
        setFormMessage({ type: '', text: '' });
        if (docFileInputRef.current) docFileInputRef.current.value = "";
        if (videoFileInputRef.current) videoFileInputRef.current.value = "";
        setDocDisplayName(''); setVideoDisplayName('');
        setQuizQuestions([]); setEditorKey(prevKey => prevKey + 1);
        window.scrollTo(0, 0);
    };

    const handleEdit = async (postId) => {
        resetForm();
        const { data: postToEdit, error } = await client.from('content_posts').select('*, category:content_categories(id, parent_id)').eq('id', postId).single();
        if (error || !postToEdit) { setFormMessage({ type: 'error', text: "Erro ao carregar o post para edição." }); return; }
        setEditingPostId(postToEdit.id); setTitle(postToEdit.title);
        if (postToEdit.category?.parent_id) {
            setSelectedParentCategory(postToEdit.category.parent_id);
            setSelectedSubCategory(postToEdit.category.id);
        } else {
            setSelectedParentCategory(postToEdit.category_id);
            setSelectedSubCategory('');
        }
        setPartNumber(postToEdit.part_number); setIsPublished(postToEdit.is_published);
        setContent(postToEdit.content || '');
        if (postToEdit.publish_at) { const localDate = new Date(postToEdit.publish_at).toISOString().slice(0, 16); setPublishAt(localDate); }
        setDocDisplayName(postToEdit.file_display_name || ''); setVideoDisplayName(postToEdit.video_display_name || '');
        setQuizQuestions(postToEdit.quiz_data || []); setEditorKey(prevKey => prevKey + 1);
        window.scrollTo(0, 0);
    };

    const handleDeletePost = async (postId, postTitle) => {
        if (!window.confirm(`Tem certeza que deseja deletar o post "${postTitle}"?`)) return;
        const { error } = await client.from('content_posts').delete().eq('id', postId);
        if (error) { setFormMessage({ type: 'error', text: 'Erro ao deletar: ' + error.message }); }
        else { setFormMessage({ type: 'success', text: `Post "${postTitle}" deletado.` }); setPosts(posts.filter(p => p.id !== postId)); }
    };

    const handleSavePost = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); setFormMessage({ type: '', text: '' });
        const finalCategoryId = selectedSubCategory || selectedParentCategory;
        if (!finalCategoryId || !title) { setFormMessage({ type: 'error', text: 'Por favor, selecione uma Categoria e um Título.' }); setIsSubmitting(false); return; }

        try {
            const processedQuizQuestions = await Promise.all(
                (quizQuestions || []).map(async (q) => {
                    if (q.newImageFile) {
                        const imagePath = `public/quiz-images/${Date.now()}-${q.newImageFile.name}`;
                        const { error: imageError } = await client.storage.from('content-images').upload(imagePath, q.newImageFile);
                        if (imageError) throw new Error('Erro no upload da imagem do quiz: ' + imageError.message);
                        const { data: urlData } = client.storage.from('content-images').getPublicUrl(imagePath);
                        const newQuestion = { ...q, imageUrl: urlData.publicUrl };
                        delete newQuestion.newImageFile; delete newQuestion.imagePreviewUrl;
                        return newQuestion;
                    }
                    return q;
                })
            );

            let docUrl = null; let vidUrl = null;
            const docFile = docFileInputRef.current?.files[0];
            const videoFile = videoFileInputRef.current?.files[0];
            if (docFile) {
                const docPath = `public/documents/${Date.now()}-${docFile.name}`;
                const { error: docError } = await client.storage.from('content-images').upload(docPath, docFile);
                if (docError) throw new Error('Erro no upload do documento: ' + docError.message);
                docUrl = client.storage.from('content-images').getPublicUrl(docPath).data.publicUrl;
            }
            if (videoFile) {
                const videoPath = `public/videos/${Date.now()}-${videoFile.name}`;
                const { error: videoError } = await client.storage.from('content-images').upload(videoPath, videoFile);
                if (videoError) throw new Error('Erro no upload do vídeo: ' + videoError.message);
                vidUrl = client.storage.from('content-images').getPublicUrl(videoPath).data.publicUrl;
            }

            const utcPublishAt = publishAt ? new Date(publishAt).toISOString() : null;
            const postDataToSave = {
                title, content, category_id: finalCategoryId, part_number: partNumber, is_published: isPublished,
                publish_at: utcPublishAt, user_id: session.user.id,
                file_display_name: docDisplayName, video_display_name: videoDisplayName,
                quiz_data: processedQuizQuestions.length > 0 ? processedQuizQuestions : null
            };

            if (docFile) postDataToSave.file_url = docUrl;
            if (videoFile) postDataToSave.video_url = vidUrl;

            const { data: savedPost, error: saveError } = editingPostId
                ? await client.from('content_posts').update(postDataToSave).eq('id', editingPostId).select().single()
                : await client.from('content_posts').insert(postDataToSave).select().single();

            if (saveError) throw new Error('Falha ao salvar post: ' + saveError.message);

            setFormMessage({ type: 'success', text: 'Post salvo com sucesso!' });
            const { data: updatedPosts } = await client.from('content_posts').select('id, title, is_published, publish_at, created_at').order('created_at', { ascending: false });
            if (updatedPosts) setPosts(updatedPosts);
            resetForm();
        } catch (error) {
            setFormMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const parentCategories = contentCategories.filter(c => c.parent_id === null);
    const subCategories = selectedParentCategory ? contentCategories.filter(c => c.parent_id === parseInt(selectedParentCategory, 10)) : [];
    const filteredPosts = posts.filter(post => { const status = getPostStatus(post); switch (filterStatus) { case 'Publicados': return status === 'Publicado'; case 'Agendados': return status === 'Agendado'; case 'Rascunhos': return status === 'Rascunho'; default: return true; } });

    if (loading) return <Loading />;

    return (
        <div>
            <Link to="/admin" className="back-button2">
                &larr; Voltar para a Admin
            </Link>
            <h2 className="admin-page-header2">{editingPostId ? `Editando Post: "${title}"` : 'Criar Novo Post'}</h2>
            {editingPostId && <button type="button" onClick={resetForm} style={{ marginBottom: '1rem' }}>+ Criar Novo Post</button>}

            <form onSubmit={handleSavePost} className="admin-form" style={{ gap: '1rem', background: 'var(--secondary-color)', borderRadius: '8px', padding: '2rem', maxWidth: '800px' }}>
                <div className='category-select-wrapper'>
                    <select value={selectedParentCategory} onChange={(e) => { setSelectedParentCategory(e.target.value); setSelectedSubCategory(''); }} required>
                        <option value="">-- Categoria Principal --</option>
                        {parentCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowNewParentInput(s => !s)}>{showNewParentInput ? '−' : '+'}</button>
                </div>

                {showNewParentInput && (
                    <div className="new-category-input-wrapper">
                        <input type="text" placeholder="Nome da Nova Categoria Principal" value={newParentCatName} onChange={e => setNewParentCatName(e.target.value)} />
                        <button type="button" onClick={handleSaveNewParentCategory}>Salvar</button>
                        <button type="button" className="cancel-button" onClick={() => setShowNewParentInput(false)}>Cancelar</button>
                    </div>
                )}

                {selectedParentCategory && (
                    <div className='category-select-wrapper'>
                        <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
                            <option value="">-- Subcategoria (Opcional) --</option>
                            {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                        <button type="button" onClick={() => setShowNewSubInput(s => !s)}>{showNewSubInput ? '−' : '+'}</button>
                    </div>
                )}

                {showNewSubInput && selectedParentCategory && (
                    <div className="new-category-input-wrapper">
                        <input type="text" placeholder="Nome da Nova Subcategoria" value={newSubCatName} onChange={e => setNewSubCatName(e.target.value)} />
                        <button type="button" onClick={handleSaveNewSubCategory}>Salvar</button>
                        <button type="button" className="cancel-button" onClick={() => setShowNewSubInput(false)}>Cancelar</button>
                    </div>
                )}

                <input type="text" placeholder="Título da Aula/Post" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <p className="part-number-indicator">Parte {partNumber}</p>
                <TiptapEditor key={editorKey} content={content} onContentChange={setContent} />

                <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Anexar Documento (PDF, DOC, etc.):</label>
                    <input type="file" ref={docFileInputRef} />
                    <input type="text" placeholder="Nome de Exibição do Documento" value={docDisplayName} onChange={(e) => setDocDisplayName(e.target.value)} style={{ width: '100%', marginTop: '0.5rem' }} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Anexar Vídeo (MP4, etc.):</label>
                    <input type="file" ref={videoFileInputRef} accept="video/*" />
                    <input type="text" placeholder="Título do Vídeo" value={videoDisplayName} onChange={(e) => setVideoDisplayName(e.target.value)} style={{ width: '100%', marginTop: '0.5rem' }} />
                </div>

                <div className="post-settings-wrapper">
                    <label><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Publicar</label>
                    <label>Agendar: <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></label>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h3 style={{ color: 'var(--accent-color)', textAlign: 'center' }}>Construtor de Quiz</h3>
                    {quizQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="quiz-question-block" style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <label>Pergunta {qIndex + 1}</label>
                            <input type="text" value={q.question_text} onChange={(e) => handleQuizChange(qIndex, 'question_text', e.target.value)} placeholder={`Texto da Pergunta ${qIndex + 1}`} />
                            <label>Imagem da Pergunta (Opcional)</label>
                            <input type="file" accept="image/*" onChange={(e) => handleQuizImageChange(qIndex, e.target.files[0])} style={{ display: 'block', marginBottom: '1rem' }} />
                            {(q.imagePreviewUrl || q.imageUrl) && (<img src={q.imagePreviewUrl || q.imageUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', display: 'block', marginBottom: '1rem' }} />)}
                            <label style={{ marginTop: '1rem', display: 'block' }}>Opções de Resposta (marque a correta):</label>
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                    <input type="radio" name={`correct_answer_${qIndex}`} checked={opt.is_correct} onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)} />
                                    <input type="text" value={opt.option_text} onChange={(e) => handleOptionChange(qIndex, oIndex, 'option_text', e.target.value)} placeholder={`Opção ${oIndex + 1}`} style={{ flexGrow: 1 }} />
                                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} style={{ padding: '4px 8px', background: 'var(--error-color)', fontSize: '0.8rem' }}>X</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOption(qIndex)} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>+ Opção</button>
                            <button type="button" onClick={() => removeQuestion(qIndex)} style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'var(--error-color)', marginLeft: '1rem' }}>Remover Pergunta</button>
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} style={{ display: 'block', margin: '1rem auto' }}>+ Adicionar Pergunta ao Quiz</button>
                </div>

                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Post'}</button>
                {formMessage.text && <p className={`admin-form-message ${formMessage.type}`}>{formMessage.text}</p>}
            </form>

            <div className="admin-list-container">
                <h3>Seus Posts</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {['Todos', 'Publicados', 'Agendados', 'Rascunhos'].map(status => (<button key={status} onClick={() => setFilterStatus(status)} className={`filter-button ${filterStatus === status ? 'active' : ''}`}>{status}</button>))}
                </div>
                <ul className="admin-list">
                    {filteredPosts.map(post => (
                        <li key={post.id} className="admin-list-item">
                            <div>
                                <span>{post.title}</span>
                                <span className={`status-badge ${getPostStatus(post).toLowerCase()}`}>{getPostStatus(post)}</span>
                            </div>
                            <div>
                                <button onClick={() => handleEdit(post.id)}>Editar</button>
                                <button onClick={() => handleDeletePost(post.id, post.title)} className="delete-button">Deletar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminContentPage;
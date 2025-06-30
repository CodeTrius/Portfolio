import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

const ContactPage = () => {
  const { client } = useSupabase();
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

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
      <h2 className="contact-page-title">Entre em Contato</h2>
      <p style={{textAlign: 'center', maxWidth: '600px', margin: '1rem auto 2rem auto'}}>
        Tem alguma pergunta, uma proposta de projeto, ou apenas quer se conectar? Sinta-se à vontade para entrar em contato.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Seu Nome" required />
        <input name="email" type="email" placeholder="Seu Email" required />
        <textarea name="message" rows="6" placeholder="Sua Mensagem" required></textarea>
        <button type="submit" disabled={submitting || !client}>
          {submitting ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
        {formMessage.text && (
          <p className={`contact-form-message ${formMessage.type}`}>
            {formMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default ContactPage;
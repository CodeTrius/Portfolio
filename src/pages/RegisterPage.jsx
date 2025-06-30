import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

const RegisterPage = () => {
    const { client } = useSupabase();
    const navigate = useNavigate();
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

        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            navigate('/registration-success');
        }
    };

    return (
        <div className="auth-container" style={{ margin: '5rem auto' }}>
            <h2 style={{ textAlign: 'center' }}>Criar Conta</h2>
            <form onSubmit={handleRegister} className="auth-form">
                <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Crie uma senha forte" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
                {message.text && <p className={`auth-message ${message.type}`}>{message.text}</p>}
                <p className="auth-switch-text">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="auth-switch-link">
                        Faça login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
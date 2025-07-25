import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                senha,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Armazena o token e o usuário no localStorage
            localStorage.setItem('token', response.data.token); // Salva o token
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario)); // Salva o usuário

            setMensagem('Login realizado com sucesso!');

            // Redireciona com base no tipo de usuário
            if (response.data.usuario.tipo === 'admin') {
                navigate('/admin');
            } else if (response.data.usuario.tipo === 'funcionario') {
                navigate('/funcionario');
            }
        } catch (error) {
            // Exibe mensagens de erro claras
            if (error.response) {
                setMensagem(error.response.data.mensagem || 'Erro ao fazer login.');
            } else {
                setMensagem('Erro de conexão com o servidor.');
            }
        }
    };

    return (
        <div className="login-body">
            <div className="login-container">
                <div className="imagem-login">
                    <img src="/logo-buongusto.png" alt="Logo" />
                </div>
                <h1>Login</h1>
                <p>Entre com suas credenciais para acessar o sistema</p>
                <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="senha">Senha</label>
                    <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="login-input"
                    required
                    />
                </div>
                <button type="submit" className="login-button">Entrar</button>
                </form>

                {mensagem && <p className="login-mensagem">{mensagem}</p>}
            </div>
        </div>
    );
}

export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CadastrarFuncionarios.css';

function CadastrarFuncionario() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Função para buscar funcionários do banco de dados
    const buscarFuncionarios = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/funcionarios');
            const data = await response.json();
            setFuncionarios(data); // Atualiza a lista de funcionários
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
        }
    };

    // Buscar funcionários ao carregar o componente
    useEffect(() => {
        buscarFuncionarios();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/cadastrar-funcionario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, senha }),
            });
            if (response.ok) {
                // Limpa os campos do formulário
                setNome('');
                setEmail('');
                setSenha('');
                setShowModal(false); // Fecha o modal

                // Busca os funcionários atualizados do banco de dados
                buscarFuncionarios();
            }
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
        }
    };

    return (
        <div className="cadastrar-funcionario-container">
            {/* Cabeçalho */}
            <header className="cabecalho-header">
                <h2>Funcionários</h2>
                <div className="botoes-cabecalho">
                    <button className="button cadastrar" onClick={() => setShowModal(true)}>
                        Cadastrar Funcionário
                    </button>
                    <button className="button voltar" onClick={() => navigate('/admin')}>
                        Voltar
                    </button>
                </div>
            </header>

            {/* Lista de Funcionários Cadastrados */}
            <div className="lista-funcionarios">
                <h2>Funcionários Cadastrados</h2>
                {funcionarios.length > 0 ? (
                    <table className="tabela-funcionarios">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcionarios.map((funcionario) => (
                                <tr key={funcionario.id}>
                                    <td>{funcionario.nome}</td>
                                    <td>{funcionario.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="sem-funcionarios">Nenhum funcionário cadastrado.</p>
                )}
            </div>

            {/* Modal para Cadastrar Funcionário */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Cadastrar Funcionário</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="nome">Nome do Funcionário</label>
                                <input
                                    type="text"
                                    id="nome"
                                    placeholder="Digite o nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Digite o e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="senha">Senha</label>
                                <input
                                    type="password"
                                    id="senha"
                                    placeholder="Digite a senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="button">Salvar</button>
                                <button type="button" className="button cancelar" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastrarFuncionario;
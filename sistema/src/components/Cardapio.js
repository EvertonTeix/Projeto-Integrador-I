import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cardapio.css';

function Cardapio() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showTipoModal, setShowTipoModal] = useState(false);
    const [produtos, setProdutos] = useState([]);
    const [novoProduto, setNovoProduto] = useState({
        id: null,
        nome: '',
        descricao: '',
        preco: '',
        tipo: ''
    });
    const [novoTipo, setNovoTipo] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [editandoProduto, setEditandoProduto] = useState(false);
    const [tipos, setTipos] = useState([]);

    useEffect(() => {
        buscarProdutos();
        buscarTipos();
    }, []);

    const buscarProdutos = async (filtroNome = '', filtroTipo = '') => {
        try {
            const url = new URL('http://localhost:5000/api/produtos');
            if (filtroNome) url.searchParams.append('nome', filtroNome);
            if (filtroTipo) url.searchParams.append('tipo', filtroTipo);

            const response = await fetch(url);
            const data = await response.json();
            setProdutos(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    const salvarProduto = async (e) => {
        e.preventDefault();
        try {
            const url = editandoProduto ? `http://localhost:5000/api/produtos/${novoProduto.id}` : 'http://localhost:5000/api/produtos';
            const method = editandoProduto ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoProduto),
            });

            if (response.ok) {
                setShowModal(false);
                setNovoProduto({ id: null, nome: '', descricao: '', preco: '', tipo: '' });
                setEditandoProduto(false);
                buscarProdutos();
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
        }
    };

    const editarProduto = (produto) => {
        setNovoProduto(produto);
        setEditandoProduto(true);
        setShowModal(true);
    };

    const removerProduto = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/produtos/${id}`, { method: 'DELETE' });
            if (response.ok) buscarProdutos();
        } catch (error) {
            console.error('Erro ao remover produto:', error);
        }
    };

    const adicionarTipo = async (e) => {
        e.preventDefault();
        if (novoTipo.trim() === '') return;

        try {
            const response = await fetch('http://localhost:5000/api/tipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoTipo }),
            });
            if (response.status === 201) {
                setShowTipoModal(false);
                setNovoTipo('');
                buscarTipos();
            }
        } catch (error) {
            console.error('Erro ao adicionar tipo:', error);
        }
    };

    const buscarTipos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tipos');
            const data = await response.json();
            setTipos(data);
        } catch (error) {
            console.error('Erro ao buscar tipos:', error);
        }
    };

    const produtosFiltrados = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        produto.tipo.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const produtosPorTipo = produtosFiltrados.reduce((acc, produto) => {
        if (!acc[produto.tipo]) acc[produto.tipo] = [];
        acc[produto.tipo].push(produto);
        return acc;
    }, {});

    return (
        <div className="cardapio-container">
            {/* Cabeçalho */}
            <header className="cardapio-header">
                <h2>Cardápio</h2>
                <div className="cardapio-actions">
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="search-input"
                    />
                    <button className="button" onClick={() => setShowModal(true)}>Adicionar Produto</button>
                    <button className="button" onClick={() => setShowTipoModal(true)}>Adicionar Tipo</button>
                    <button className="button voltar" onClick={() => navigate('/admin')}>Voltar</button>
                </div>
            </header>

            {/* Lista de Produtos */}
            <div className="conteudo-principal">
                {Object.keys(produtosPorTipo).length > 0 ? (
                    Object.keys(produtosPorTipo).map((tipo) => (
                        <div key={tipo} className="tipo-produto">
                            <h3>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
                            <table className="produtos-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nome</th>
                                        <th>Descrição</th>
                                        <th>Preço</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosPorTipo[tipo].map((produto) => (
                                        <tr key={produto.id}>
                                            <td>{produto.id}</td>
                                            <td>{produto.nome}</td>
                                            <td>{produto.descricao}</td>
                                            <td>R$ {produto.preco.toFixed(2)}</td>
                                            <td className="acoes-cell">
                                                <button className="button-editar" onClick={() => editarProduto(produto)}>Editar</button>
                                                <button className="button-remover" onClick={() => removerProduto(produto.id)}>Remover</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <div className="sem-produtos">
                        <p>Nenhum produto cadastrado.</p>
                    </div>
                )}
            </div>

            {/* Modal para Adicionar/Editar Produto */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editandoProduto ? 'Editar Produto' : 'Adicionar Produto'}</h3>
                        <form onSubmit={salvarProduto}>
                            <input
                                type="text"
                                placeholder="Nome"
                                value={novoProduto.nome}
                                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                                required
                                className="input"
                            />
                            <input
                                type="text"
                                placeholder="Descrição"
                                value={novoProduto.descricao}
                                onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                                className="input"
                            />
                            <input
                                type="number"
                                placeholder="Preço"
                                value={novoProduto.preco}
                                onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                                required
                                className="input"
                            />
                            <select
                                value={novoProduto.tipo}
                                onChange={(e) => setNovoProduto({ ...novoProduto, tipo: e.target.value })}
                                required
                                className="input"
                            >
                                <option value="">Selecione o tipo</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
                                ))}
                            </select>
                            <div className="modal-buttons">
                                <button type="submit" className="button">{editandoProduto ? 'Salvar Alterações' : 'Salvar'}</button>
                                <button type="button" className="button cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Adicionar Tipo */}
            {showTipoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Adicionar Tipo</h3>
                        <form onSubmit={adicionarTipo}>
                            <input
                                type="text"
                                placeholder="Novo tipo (ex: Pizza, Bebida)"
                                value={novoTipo}
                                onChange={(e) => setNovoTipo(e.target.value)}
                                required
                                className="input"
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="button">Salvar</button>
                                <button type="button" className="button cancelar" onClick={() => setShowTipoModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cardapio;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cardapio.css';

function Cardapio() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showTipoModal, setShowTipoModal] = useState(false);
    const [showGerenciarCategoriasModal, setShowGerenciarCategoriasModal] = useState(false);
    const [produtos, setProdutos] = useState([]);
    const [novoProduto, setNovoProduto] = useState({
        id: null,
        nome: '',
        descricao: '',
        preco: '',
        tipo: ''
    });
    const [novoTipo, setNovoTipo] = useState('');
    const [editandoProduto, setEditandoProduto] = useState(false);
    const [editandoTipo, setEditandoTipo] = useState(false);
    const [tipoEditando, setTipoEditando] = useState(null);
    const [tipos, setTipos] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState('');

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [produtosRes, tiposRes] = await Promise.all([
                    fetch('http://localhost:5000/api/produtos'),
                    fetch('http://localhost:5000/api/tipos')
                ]);
                
                const dataProdutos = await produtosRes.json();
                const dataTipos = await tiposRes.json();
                
                setProdutos(dataProdutos || []);
                
                // Verificação mais segura dos tipos
                if (dataTipos && Array.isArray(dataTipos)) {
                    const tiposOrdenados = ordenarTipos(dataTipos);
                    setTipos(tiposOrdenados);
                    
                    // Só define abaAtiva se houver tipos
                    if (tiposOrdenados.length > 0) {
                        setAbaAtiva(prev => prev || tiposOrdenados[0].nome);
                    }
                } else {
                    setTipos([]);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setTipos([]);
                setProdutos([]);
            }
        };
        
        carregarDados();
    }, []);

    // Atualizar aba ativa quando tipos mudam
    useEffect(() => {
        if (tipos.length > 0 && !tipos.some(t => t.nome === abaAtiva)) {
            setAbaAtiva(tipos[0].nome);
        }
    }, [tipos, abaAtiva]);
    
    const ordenarTipos = (tiposArray) => {
        // Verificação mais segura
        if (!Array.isArray(tiposArray)) return [];
        
        return [...tiposArray].sort((a, b) => {
            // Verifica se os objetos e propriedades existem
            const nomeA = a?.nome || '';
            const nomeB = b?.nome || '';
            return nomeA.localeCompare(nomeB);
        });
    };

    const salvarProduto = async (e) => {
        e.preventDefault();
        try {
            const url = editandoProduto 
                ? `http://localhost:5000/api/produtos/${novoProduto.id}`
                : 'http://localhost:5000/api/produtos';
                
            const method = editandoProduto ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: novoProduto.nome,
                    descricao: novoProduto.descricao,
                    preco: novoProduto.preco,
                    tipo: novoProduto.tipo
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro ao salvar produto');
            }

            // Atualiza a lista de produtos
            if (editandoProduto) {
                setProdutos(prevProdutos => 
                    prevProdutos.map(p => p.id === novoProduto.id ? data : p)
                );
            } else {
                setProdutos(prevProdutos => [...prevProdutos, data]);
            }
            
            // Fecha o modal e reseta o formulário
            setShowModal(false);
            setNovoProduto({
                id: null,
                nome: '',
                descricao: '',
                preco: '',
                tipo: ''
            });
            setEditandoProduto(false);

        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    };

    const editarProduto = (produto) => {
        setNovoProduto({
            id: produto.id,
            nome: produto.nome,
            descricao: produto.descricao,
            preco: produto.preco,
            tipo: produto.tipo
        });
        setEditandoProduto(true);
        setShowModal(true);
    };

    const removerProduto = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/produtos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setProdutos(produtos.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Erro ao remover produto:', error);
        }
    };

    const adicionarTipo = async (e) => {
        e.preventDefault();
        if (!novoTipo?.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/tipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoTipo }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro ao salvar tipo');
            }

            // Agora data contém {id, nome}
            setTipos(prevTipos => 
                [...prevTipos, data].sort((a, b) => a.nome.localeCompare(b.nome))
            );
            
            setAbaAtiva(data.nome);
            setShowTipoModal(false);
            setNovoTipo('');
            
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    };

    const editarTipo = async (e) => {
        e.preventDefault();
        if (!novoTipo?.trim() || !tipoEditando) return;

        try {
            const response = await fetch(`http://localhost:5000/api/tipos/${tipoEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoTipo }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Trata os erros específicos do backend
                if (response.status === 409) {
                    throw new Error(data.mensagem || 'Este tipo já existe');
                }
                throw new Error(data.mensagem || 'Erro ao atualizar tipo');
            }

            // Atualização otimista do estado
            setTipos(prevTipos => 
                prevTipos.map(t => 
                    t.id === tipoEditando.id ? data : t
                ).sort((a, b) => a.nome.localeCompare(b.nome))
            );

            // Atualiza produtos que usavam o tipo antigo
            setProdutos(prevProdutos => 
                prevProdutos.map(p => 
                    p.tipo === tipoEditando.nome ? { ...p, tipo: data.nome } : p
                )
            );

            // Atualiza aba ativa se necessário
            if (abaAtiva === tipoEditando.nome) {
                setAbaAtiva(data.nome);
            }

            // Fecha o modal e reseta estados
            setShowTipoModal(false);
            setNovoTipo('');
            setEditandoTipo(false);
            setTipoEditando(null);

        } catch (error) {
            console.error('Erro ao editar tipo:', error);
            alert(error.message);
        }
    };

    const removerTipo = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tipos/${id}`, { 
                method: 'DELETE' 
            });
            
            if (response.ok) {
                // Remove o tipo e ordena a lista resultante
                setTipos(prevTipos => 
                    prevTipos.filter(t => t.id !== id)
                            .sort((a, b) => a.nome.localeCompare(b.nome))
                );
                
                if (abaAtiva === tipos.find(t => t.id === id)?.nome) {
                    const novosTipos = tipos.filter(t => t.id !== id);
                    setAbaAtiva(novosTipos.length > 0 ? novosTipos[0].nome : '');
                }
            }
        } catch (error) {
            console.error('Erro ao remover tipo:', error);
        }
    };

        const produtosFiltrados = React.useMemo(() => {
            return produtos
                .filter(produto => produto.tipo === abaAtiva)
                .sort((a, b) => a.nome.localeCompare(b.nome));
        }, [produtos, abaAtiva]);

    // No seu JSX, renderize os produtos filtrados:
    {produtosFiltrados.map(produto => (
        <div key={produto.id} className="produto-card">
            {/* Seu conteúdo do produto aqui */}
        </div>
    ))}


    // Adicione no final do componente, antes do return
    useEffect(() => {
        console.log('Estado atual de tipos:', tipos);
        console.log('Estado atual de produtos:', produtos);
    }, [tipos, produtos]);

    return (
        <div className="cardapio-container">
            <header className="cardapio-header">
                <h2>Cardápio</h2>
                <div className="cardapio-actions">
                    <button className="button" onClick={() => setShowModal(true)}>Adicionar Produto</button>
                    <button 
                        className="button"
                        onClick={() => setShowGerenciarCategoriasModal(true)}
                    >
                        Gerenciar Categorias
                    </button>
                    <button className="button voltar" onClick={() => navigate('/admin')}>Voltar</button>
                </div>
            </header>

            <div className="abas-container">
                {tipos.map(tipo => (
                    <button
                        key={tipo.id}
                        className={`aba ${abaAtiva === tipo.nome ? 'ativa' : ''}`}
                        onClick={() => setAbaAtiva(tipo.nome)}
                    >
                        {tipo.nome}
                    </button>
                ))}
            </div>

            <div className="conteudo-aba">
                {produtosFiltrados.length > 0 ? (
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
                            {produtosFiltrados.map(produto => (
                                <tr key={produto.id}>
                                    <td>{produto.id}</td>
                                    <td>{produto.nome}</td>
                                    <td>{produto.descricao}</td>
                                    <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
                                    <td>
                                        <button className="button editar" onClick={() => editarProduto(produto)}>Editar</button>
                                        <button className="button remover" onClick={() => removerProduto(produto.id)}>Remover</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="sem-produtos">
                        <p>Nenhum produto encontrado nesta categoria.</p>
                    </div>
                )}
            </div>

            {/* Modal de Produto */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editandoProduto ? 'Editar Produto' : 'Adicionar Produto'}</h3>
                        <form onSubmit={salvarProduto}>
                            <input type="text" placeholder="Nome" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} required className="input" />
                            <input type="text" placeholder="Descrição" value={novoProduto.descricao} onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })} className="input" />
                            <input type="number" step="0.01" placeholder="Preço" value={novoProduto.preco} onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })} required className="input" />
                            <select value={novoProduto.tipo} onChange={(e) => setNovoProduto({ ...novoProduto, tipo: e.target.value })} required className="input">
                                <option value="">Selecione o tipo</option>
                                {tipos.map(tipo => (
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

            {/* Modal de Adicionar/Editar Categoria */}
            {showTipoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editandoTipo ? 'Editar Categoria' : 'Adicionar Categoria'}</h3>
                        <form onSubmit={editandoTipo ? editarTipo : adicionarTipo}>
                            <input 
                                type="text" 
                                placeholder="Nome da categoria (ex: Pizza, Bebida)" 
                                value={novoTipo} 
                                onChange={(e) => setNovoTipo(e.target.value)} 
                                required 
                                className="input" 
                            />
                            <div className="modal-buttons">
                                <button type="submit" className="button">
                                    {editandoTipo ? 'Salvar Alterações' : 'Salvar'}
                                </button>
                                <button 
                                    type="button" 
                                    className="button cancelar" 
                                    onClick={() => {
                                        setShowTipoModal(false);
                                        setNovoTipo('');
                                        setEditandoTipo(false);
                                        setTipoEditando(null);
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Gerenciar Categorias */}
            {showGerenciarCategoriasModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Gerenciar Categorias</h3>
                        <div className="categorias-list">
                            {tipos.map(tipo => (
                                <div key={tipo.id} className="categoria-item">
                                    <span>{tipo.nome}</span>
                                    <div className="categoria-actions">
                                        <button 
                                            className="button-editar"
                                            onClick={() => {
                                                setShowGerenciarCategoriasModal(false);
                                                setNovoTipo(tipo.nome);
                                                setTipoEditando(tipo);
                                                setEditandoTipo(true);
                                                setShowTipoModal(true);
                                            }}
                                        >
                                            Renomear
                                        </button>
                                        <button 
                                            className="button-remover"
                                            onClick={() => removerTipo(tipo.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="button"
                                onClick={() => {
                                    setShowGerenciarCategoriasModal(false);
                                    setNovoTipo('');
                                    setEditandoTipo(false);
                                    setTipoEditando(null);
                                    setShowTipoModal(true);
                                }}
                            >
                                Adicionar Nova Categoria
                            </button>
                            <button 
                                className="button cancelar" 
                                onClick={() => setShowGerenciarCategoriasModal(false)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cardapio;
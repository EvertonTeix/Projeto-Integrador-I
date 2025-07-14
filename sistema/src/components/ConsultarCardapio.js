import React, { useEffect, useState } from 'react';
import '../styles/ConsultarCardapio.css';
import { useNavigate } from 'react-router-dom';

function ConsultarCardapio() {
    const [produtos, setProdutos] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        buscarProdutos();
    }, []);

    const buscarProdutos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/produtos');
            const data = await response.json();
            setProdutos(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        produto.tipo.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const produtosPorTipo = produtosFiltrados.reduce((acc, produto) => {
        if (!acc[produto.tipo]) acc[produto.tipo] = [];
        acc[produto.tipo].push(produto);
        return acc;
    }, {});

    return (
        <div className="consultar-container">
            <header className="consultar-header">
                <h2>Cardápio</h2>
                <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="search-input"
                />
            </header>

            <div className="produtos-por-tipo">
                {Object.keys(produtosPorTipo).length > 0 ? (
                    Object.keys(produtosPorTipo).map((tipo) => (
                        <div key={tipo} className="tipo-section-func">
                            <h3>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
                            <div className="coluna-produtos">
                                {produtosPorTipo[tipo].map((produto) => (
                                    <div key={produto.id} className="produto-item">
                                        <h4>{produto.nome}</h4>
                                        <p>{produto.descricao}</p>
                                        <span>R$ {produto.preco.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Nenhum produto encontrado.</p>
                )}
            </div>
            <div className="pedido-footer-func">
                <button className="button voltar" onClick={() => navigate('/funcionario')}>Voltar</button>
            </div>
        </div>
    );
}

export default ConsultarCardapio; 

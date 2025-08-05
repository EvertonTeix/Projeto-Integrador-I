import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ConsultarCardapio.css';

function ConsultarCardapio() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
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
                
                if (dataTipos && Array.isArray(dataTipos)) {
                    const tiposOrdenados = [...dataTipos].sort((a, b) => a.nome.localeCompare(b.nome));
                    setTipos(tiposOrdenados);
                    
                    if (tiposOrdenados.length > 0) {
                        setAbaAtiva(tiposOrdenados[0].nome);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };
        
        carregarDados();
    }, []);

    const produtosFiltrados = produtos.filter(produto => produto.tipo === abaAtiva);

    return (
        <div className="cardapio-container">
            <header className="cardapio-header">
                <h2>Cardápio</h2>
                <button className="button voltar" onClick={() => navigate('/funcionario')}>
                    Voltar
                </button>
            </header>

            <div className="abas-container">
                {tipos.map(tipo => (
                    <div key={tipo.id} className="aba-wrapper">
                        <button
                            className={`aba ${abaAtiva === tipo.nome ? 'ativa' : ''}`}
                            onClick={() => setAbaAtiva(tipo.nome)}
                        >
                            {tipo.nome}
                        </button>
                    </div>
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
                            </tr>
                        </thead>
                        <tbody>
                            {produtosFiltrados.map(produto => (
                                <tr key={produto.id}>
                                    <td>#{produto.id}</td>
                                    <td>{produto.nome}</td>
                                    <td>{produto.descricao}</td>
                                    <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
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
        </div>
    );
}

export default ConsultarCardapio;
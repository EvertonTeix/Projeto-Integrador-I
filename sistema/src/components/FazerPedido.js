import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FazerPedido.css';

function FazerPedido() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [mesa, setMesa] = useState('');
    const [itensSelecionados, setItensSelecionados] = useState([]);
    const [total, setTotal] = useState(0);
    const usuario = JSON.parse(localStorage.getItem('usuario'));

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

    const toggleProduto = (produto) => {
        const existe = itensSelecionados.find(item => item.id === produto.id);
        let novaLista;
        if (existe) {
            novaLista = itensSelecionados.filter(item => item.id !== produto.id);
        } else {
            novaLista = [...itensSelecionados, { ...produto, quantidade: 1 }];
        }
        setItensSelecionados(novaLista);
        calcularTotal(novaLista);
    };

    const alterarQuantidade = (produtoId, operacao) => {
        const produto = produtos.find(p => p.id === produtoId);
        const existe = itensSelecionados.find(item => item.id === produtoId);

        let novaLista;
        if (!existe && operacao === '+') {
            novaLista = [...itensSelecionados, { ...produto, quantidade: 1 }];
        } else if (existe) {
            const novaQtd = operacao === '+' ? existe.quantidade + 1 : existe.quantidade - 1;
            if (novaQtd <= 0) {
                novaLista = itensSelecionados.filter(item => item.id !== produtoId);
            } else {
                novaLista = itensSelecionados.map(item =>
                    item.id === produtoId ? { ...item, quantidade: novaQtd } : item
                );
            }
        } else {
            return; // Evita diminuir quantidade se o item não existe
        }

        setItensSelecionados(novaLista);
        calcularTotal(novaLista);
    };


    const calcularTotal = (lista) => {
        const soma = lista.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        setTotal(soma);
    };

    const enviarPedido = async () => {
        if (itensSelecionados.length === 0) {
            alert("Selecione pelo menos um item.");
            return;
        }

        if (!usuario || !usuario.id) {
            alert("Usuário não encontrado. Faça login novamente.");
            return;
        }

        const pedido = {
            funcionario_id: usuario?.id,
            total,
            produtos: itensSelecionados.map(p => ({
                id: p.id,
                quantidade: p.quantidade
            }))
        };

        try {
            const response = await fetch('http://localhost:5000/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
            if (response.ok) {
                alert("Pedido enviado com sucesso!");
                setItensSelecionados([]);
                setMesa('');
                setTotal(0);
            } else {
                alert("Erro ao enviar pedido.");
            }
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
        }
    };

    return (
        <div className="pedido-container">
            <div className="pedido-header">
                <h2>Fazer Pedido</h2>
                <input
                    type="text"
                    placeholder="Número da mesa"
                    value={mesa}
                    onChange={(e) => setMesa(e.target.value)}
                    className="input-mesa"
                />
            </div>

            <div className="produtos-lista">
                {Object.keys(produtos.reduce((acc, produto) => {
                    if (!acc[produto.tipo]) acc[produto.tipo] = [];
                    acc[produto.tipo].push(produto);
                    return acc;
                }, {})).map((tipo) => {
                    const produtosDoTipo = produtos.filter(p => p.tipo === tipo);
                    return (
                        <div key={tipo} className="tipo-section">
                            <h3>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
                            <div className="coluna-produtos">
                                {produtosDoTipo.map((produto) => {
                                    const itemSelecionado = itensSelecionados.find(p => p.id === produto.id);
                                    return (
                                        <div
                                            key={produto.id}
                                            className={`produto-item ${itemSelecionado ? 'selecionado' : ''}`}
                                            onClick={() => toggleProduto(produto)}
                                        >
                                            <div className="produto-info">
                                                <h4>{produto.nome}</h4>
                                                <p>{produto.descricao}</p>
                                                <span>R$ {produto.preco.toFixed(2)}</span>
                                            </div>
                                            <div className="quantidade-controles" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => alterarQuantidade(produto.id, '-')}>-</button>
                                                <span>{itemSelecionado ? itemSelecionado.quantidade : 0}</span>
                                                <button onClick={() => alterarQuantidade(produto.id, '+')}>+</button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pedido-footer">
                <h3>Total: R$ {total.toFixed(2)}</h3>
                <button className="button" onClick={enviarPedido}>Enviar Pedido</button>
                <button className="button voltar" onClick={() => navigate('/funcionario')}>Voltar</button>
            </div>
        </div>
    );
}

export default FazerPedido;

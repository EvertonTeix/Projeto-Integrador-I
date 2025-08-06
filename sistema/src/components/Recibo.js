import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function Recibo() {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:5000/api/pedidos-completos`)
            .then(res => res.json())
            .then(data => {
                const encontrado = data.find(p => p.id === parseInt(id));
                setPedido(encontrado);
            })
            .catch(err => console.error("Erro:", err));
    }, [id]);

    const handleImpressaoTermica = () => {
        fetch('http://localhost:5000/api/imprimir-recibo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        })
        .catch(err => {
            console.error("Erro ao imprimir:", err);
            alert("Erro ao tentar imprimir na impressora térmica.");
        });
    };

    if (!pedido) return <div>Carregando pedido...</div>;

    return (
        <div>
            <div className="recibo" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center' }}>Esfiharia Buon Gusto</h1>
                <h2>Recibo do Pedido #{pedido.id}</h2>
                <p>Data: {pedido.data_hora}</p>
                
                <p><strong>Cliente: {pedido.nome_cliente}</strong></p>
                {pedido.endereco && (
                    <p>Endereço: {pedido.endereco}</p>
                )}
                <p>Forma de Pagamento: {pedido.forma_pagamento}</p>
                {pedido.observacao_pedido && (
                    <p>Observações do Pedido: {pedido.observacao_pedido}</p>
                )}

                <hr />
                <ul>
                    {pedido.itens.map((item, idx) => (
                        <li key={idx}>
                            {item.quantidade}x {item.tipo} de {item.nome} - R$ {item.preco_unitario.toFixed(2)}
                            {item.observacao && (
                                <div style={{ fontStyle: 'italic', fontSize: '0.9em', marginLeft: '10px' }}>
                                    Observação: {item.observacao}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                <hr />
                <table className="resumo-itens-table">
                    <tbody>
                        <tr>
                            <td><strong>Total de Esfihas</strong></td>
                            <td>{pedido.total_esfihas ?? 0}</td>
                        </tr>
                        <tr>
                            <td><strong>Total de Pizzas</strong></td>
                            <td>{pedido.total_pizzas ?? 0}</td>
                        </tr>
                    </tbody>
                </table>
                <h3>Total: R$ {pedido.total.toFixed(2)}</h3>

                {/* Botão novo para impressão térmica */}
                <button className="button no-print" onClick={handleImpressaoTermica}>
                    Imprimir via Térmica
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
                <button className="button voltar no-print" onClick={() => navigate('/meus-pedidos')}>
                    Voltar
                </button>  
            </div>
        </div>
    );
}

export default Recibo;

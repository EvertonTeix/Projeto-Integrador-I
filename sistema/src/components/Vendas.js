import React, { useEffect, useState } from 'react';
import { FiPrinter, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import '../styles/Vendas.css';

function Vendas() {
    const [filaPedidos, setFilaPedidos] = useState([]);
    const [pedidosImpressos, setPedidosImpressos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/pedidos-completos')
            .then(res => res.json())
            .then(setFilaPedidos)
            .catch(err => console.error("Erro:", err));
    }, []);

    const marcarComoImpresso = () => {
        if (filaPedidos.length === 0) return;
        const [primeiroPedido, ...resto] = filaPedidos;
        setFilaPedidos(resto);
        setPedidosImpressos(prev => [...prev, primeiroPedido]);
    };

    return (
        <div className="vendas-container">
            <div className="pedido-header">
                <h2>Vendas</h2>
                <button className="button imprimir" onClick={marcarComoImpresso}>
                    Imprimir próximo (FIFO)
                </button>
                <button className="button voltar no-print" onClick={() => navigate('/admin')}>
                    Voltar
                </button>
            </div>

            <div className="pedidos-lista">
                <h3>Pedidos Pendentes</h3>
                <div>
                    {filaPedidos.length === 0 && <p>Nenhum pedido pendente.</p>}
                    {filaPedidos.map(pedido => (
                        <div key={pedido.id} className="recibo">
                            <div className="recibo-topo">
                                <h3>Pedido #{pedido.id}</h3>
                                <FiPrinter 
                                    size={28}
                                    onClick={() => navigate(`/recibo/${pedido.id}`)} 
                                    title="Imprimir Pedido"
                                />
                            </div>
                            <p>Data: {pedido.data_hora}</p>
                            <p>Funcionário: {pedido.funcionario}</p>
                            <ul>
                                {pedido.itens.map((item, idx) => (
                                    <li key={idx}>
                                        {item.quantidade}x {item.produto} — R$ {item.preco_unitario.toFixed(2)} (Subtotal: R$ {item.subtotal.toFixed(2)})
                                    </li>
                                ))}
                            </ul>
                            <p><strong>Total: R$ {pedido.total.toFixed(2)}</strong></p>
                        </div>
                    ))}
                </div>

                <h3>Pedidos Impressos</h3>
                <div className="recibos-lista impressos">
                    {pedidosImpressos.length === 0 && <p>Nenhum pedido impresso ainda.</p>}
                    {pedidosImpressos.map(pedido => (
                        <div key={pedido.id} className="recibo impresso">
                            <div className="recibo-topo">
                                <h3>Pedido #{pedido.id}</h3>
                                <FiCheckCircle size={28} color="green" title="Pedido Impresso" />
                            </div>
                            <p>Data: {pedido.data_hora}</p>
                            <p>Funcionário: {pedido.funcionario}</p>
                            <ul>
                                {pedido.itens.map((item, idx) => (
                                    <li key={idx}>
                                        {item.quantidade}x {item.produto} — R$ {item.preco_unitario.toFixed(2)} (Subtotal: R$ {item.subtotal.toFixed(2)})
                                    </li>
                                ))}
                            </ul>
                            <p><strong>Total: R$ {pedido.total.toFixed(2)}</strong></p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Vendas;

import React, { useEffect, useState } from 'react';
import { FiPrinter } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import '../styles/Vendas.css';

function Vendas() {
    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/pedidos-completos')
            .then(res => res.json())
            .then(setPedidos)
            .catch(err => console.error("Erro:", err));
    }, []);

    return (
        <div className="vendas-container">
            <div className="pedido-header">
                <h2>Vendas</h2>
                <button className="button voltar" onClick={() => navigate('/admin')}>
                    Voltar
                </button>
            </div>

            <div className="recibos-lista">
                {pedidos.map(pedido => (
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
        </div>
    );
}

export default Vendas;

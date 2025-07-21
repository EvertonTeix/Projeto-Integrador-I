import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Recibo() {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/pedidos-completos`)
            .then(res => res.json())
            .then(data => {
                const encontrado = data.find(p => p.id === parseInt(id));
                setPedido(encontrado);
            })
            .catch(err => console.error("Erro:", err));
    }, [id]);

    if (!pedido) return <div>Carregando pedido...</div>;

    return (
        <div className="recibo" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center' }}>Esfiharia Buon Gusto</h1>
            <h2>Recibo do Pedido #{pedido.id}</h2>
            <p>Data: {pedido.data_hora}</p>
            <p>Funcionário: {pedido.funcionario}</p>
            <hr />
            <ul>
                {pedido.itens.map((item, idx) => (
                    <li key={idx}>{item.quantidade}x {item.produto} - R$ {item.preco_unitario.toFixed(2)}</li>
                ))}
            </ul>
            <hr />
            <h3>Total: R$ {pedido.total.toFixed(2)}</h3>
            <button onClick={() => window.print()}>Imprimir</button>
        </div>
    );
}

export default Recibo;

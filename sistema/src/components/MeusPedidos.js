import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MeusPedidos.css';

function MeusPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [totalGeral, setTotalGeral] = useState(0);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        const buscarPedidos = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/pedidos/funcionario/${usuario.id}`);
                const data = await response.json();
                setPedidos(data);
                const soma = data.reduce((acc, pedido) => acc + pedido.total, 0);
                setTotalGeral(soma);
            } catch (error) {
                console.error('Erro ao buscar pedidos:', error);
            }
        };

        if (usuario?.id) {
            buscarPedidos();
        }
    }, [usuario?.id]);


    const pedidosPorData = pedidos.reduce((acc, pedido) => {
        const data = new Date(pedido.data_hora).toLocaleDateString();
        if (!acc[data]) acc[data] = [];
        acc[data].push(pedido);
        return acc;
    }, {});


    return (
        <div className="meus-pedidos-container">
            <div className="meus-pedidos-header">
                <h2>Meus Pedidos</h2>
            </div>

            {Object.keys(pedidosPorData).map(data => (
                <div key={data} className="grupo-data">
                    <h3>{data}</h3>
                    {pedidosPorData[data].map(pedido => (
                        <div key={pedido.id} className="pedido-card">
                            <div classname="pedido-info">
                                <p><strong>ID:</strong> {pedido.id}</p>
                                <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
                                <p><strong>Horário:</strong> {new Date(pedido.data_hora).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="meuspedidos-footer">
                <div className="total-geral">
                     <h3>Total Geral: R$ {totalGeral.toFixed(2)}</h3>
                </div>
                <button onClick={() => navigate('/funcionario')} className="botao-voltar">Voltar</button>
            </div>
        </div>
    );
}

export default MeusPedidos;

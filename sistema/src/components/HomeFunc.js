import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeFunc.css';

function HomeFunc() {
    const navigate = useNavigate();
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [totalVendido, setTotalVendido] = useState(0);
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (usuario?.id) {
            fetch(`http://localhost:5000/api/pedidos/funcionario/${usuario.id}`)
                .then(res => res.json())
                .then(data => {
                    setTotalPedidos(data.length);
                    const soma = data.reduce((acc, pedido) => acc + pedido.total, 0);
                    setTotalVendido(soma);
                })
                .catch(error => console.error('Erro ao buscar dados do funcionário:', error));
        }
    }, [usuario?.id]); 

    return (
        <div className="home-funcionario">
            {/* Menu Lateral */}
            <div className="menu-lateral">
                <div className="imagem-login">
                    <img src="/logo-buongusto.png" alt="Logo" />
                </div>
                <h2 className="menu-titulo">Funcionário</h2>
                <ul className="menu-opcoes">
                    <li className="menu-item" onClick={() => navigate('/fazer-pedido')}>Fazer Pedido</li>
                    <li className="menu-item" onClick={() => navigate('/consultar-cardapio')}>Consultar Cardápio</li>
                    <li className="menu-item" onClick={() => navigate('/meus-pedidos')}>Meus Pedidos</li>
                    <li className="menu-item sair" onClick={() => navigate('/login')}>Sair</li>
                </ul>
            </div>

            {/* Conteúdo Principal (você vai implementar depois) */}
            <div className="conteudo-principal">
                <h1>Bem-vindo(a)</h1>
                <p>Selecione uma opção no menu ao lado para começar.</p>

                <div className="cards-container">
                    <div className="card" onClick={() => navigate('/meus-pedidos')}>
                        <h2>Quantidade de Pedidos</h2>
                        <p>{totalPedidos}</p>
                    </div>
                    <div className="card">
                        <h2>Total Vendido</h2>
                        <p>R$ {totalVendido.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeFunc;

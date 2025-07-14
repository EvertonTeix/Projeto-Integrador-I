import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeFunc.css';

function HomeFunc() {
    const navigate = useNavigate();

    return (
        <div className="home-funcionario">
            {/* Menu Lateral */}
            <div className="menu-lateral">
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
                <h1>Bem-vindo</h1>
                <p>Selecione uma opção no menu ao lado para começar.</p>
            </div>
        </div>
    );
}

export default HomeFunc;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeAdmin.css';

function HomeAdmin() {
    const navigate = useNavigate();
    const [totalFuncionarios, setTotalFuncionarios] = useState(0);
    const [totalProdutos, setTotalProdutos] = useState(0);
    const [vendasDoDia, setVendasDoDia] = useState(0);

    // Função para buscar os dados do banco de dados
    const buscarDados = async () => {
        try {
            // Busca o total de funcionários
            const responseFuncionarios = await fetch('http://localhost:5000/api/funcionarios');
            const dataFuncionarios = await responseFuncionarios.json();
            setTotalFuncionarios(dataFuncionarios.length);

            // Busca o total de produtos
            const responseProdutos = await fetch('http://localhost:5000/api/produtos');
            const dataProdutos = await responseProdutos.json();
            setTotalProdutos(dataProdutos.length);

            // Busca as vendas do dia
            const responseVendas = await fetch('http://localhost:5000/api/vendas/hoje');
            const dataVendas = await responseVendas.json();
            setVendasDoDia(dataVendas.total || 0); // Assume que a API retorna { total: 1200.50 }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    // Carrega os dados ao montar o componente
    useEffect(() => {
        buscarDados();
    }, []);

    return (
        <div className="home-admin">
            {/* Menu Lateral */}
            <div className="menu-lateral">
                <div className="imagem-login">
                    <img src="/logo-buongusto.png" alt="Logo" />
                </div>
                <h2 className="menu-titulo">Administrativo</h2>
                <ul className="menu-opcoes">
                    <li className="menu-item" onClick={() => navigate('/cardapio')}>Cardápio</li>
                    <li className="menu-item" onClick={() => navigate('/vendas')}>Vendas</li>
                    <li className="menu-item" onClick={() => navigate('/funcionarios')}>Funcionários</li>
                    <li className="menu-item sair" onClick={() => navigate('/login')}>Sair</li>
                </ul>
            </div>

            {/* Conteúdo Principal */}
            <div className="conteudo-principal">
                <h1>Bem-vindo ao Painel Administrativo</h1>
                <p>Selecione uma opção no menu ao lado para começar.</p>

                {/* Cards de Resumo */}
                <div className="cards-container">
                    <div className="card" onClick={() => navigate('/funcionarios')}>
                        <h2>Funcionários Cadastrados</h2>
                        <p>{totalFuncionarios}</p>
                    </div>
                    <div className="card" onClick={() => navigate('/cardapio')}>
                        <h2>Produtos Cadastrados</h2>
                        <p>{totalProdutos}</p>
                    </div>
                    <div className="card" onClick={() => navigate('/vendas')}>
                        <h2>Vendas do Dia</h2>
                        <p>R$ {vendasDoDia.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeAdmin;
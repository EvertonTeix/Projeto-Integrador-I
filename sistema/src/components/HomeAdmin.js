import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeAdmin.css';

function HomeAdmin() {
    const navigate = useNavigate();
    const [totalFuncionarios, setTotalFuncionarios] = useState(0);
    const [totalProdutos, setTotalProdutos] = useState(0);
    const [vendasDoDia, setVendasDoDia] = useState(0);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Atualiza a data e hora a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Função para buscar os dados do banco de dados
    const buscarDados = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Busca em paralelo para melhor performance
            const [resFunc, resProd, resVendas] = await Promise.all([
                fetch('http://localhost:5000/api/funcionarios'),
                fetch('http://localhost:5000/api/produtos'),
                fetch('http://localhost:5000/api/vendas/hoje')
            ]);

            // Verifica se todas as respostas estão OK
            if (!resFunc.ok || !resProd.ok || !resVendas.ok) {
                throw new Error('Erro ao carregar dados');
            }

            const [dataFunc, dataProd, dataVendas] = await Promise.all([
                resFunc.json(),
                resProd.json(),
                resVendas.json()
            ]);

            setTotalFuncionarios(dataFunc.length);
            setTotalProdutos(dataProd.length);
            setVendasDoDia(dataVendas.total || 0);
            
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setError('Erro ao carregar dados. Tente recarregar a página.');
            setVendasDoDia(0);
        } finally {
            setLoading(false);
        }
    };

    // Carrega os dados ao montar o componente e configura atualização periódica
    useEffect(() => {
        // Busca imediata ao carregar
        buscarDados();

        // Configura intervalo para buscar a cada 30 segundos
        const intervalId = setInterval(buscarDados, 30000);
        
        // Atualiza quando a página ganha foco
        const handleVisibilityChange = () => {
            if (!document.hidden) buscarDados();
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Formata a data
    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Formata a hora
    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR');
    };

    // Formata valor monetário
    const formatMoney = (value) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

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
                <div className="header-dashboard">
                    <div>
                        <h1>Bem-vindo ao Painel Administrativo</h1>
                    </div>
                    <div className="data-hora-container">
                        <div className="data-display">
                            <span className="data-texto">{formatDate(currentDateTime)}</span>
                        </div>
                        <div className="hora-display">
                            <span className="hora-texto">{formatTime(currentDateTime)}</span>
                        </div>
                    </div>
                </div>

                <p className="subtitulo">Selecione uma opção no menu ao lado para começar.</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={buscarDados} className="botao-recarga">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-spinner">
                        Carregando dados...
                    </div>
                ) : (
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
                            <p>{formatMoney(vendasDoDia)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeAdmin;
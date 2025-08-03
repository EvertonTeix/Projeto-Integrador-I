import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeFunc.css';

function HomeFunc() {
  const navigate = useNavigate();
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalVendido, setTotalVendido] = useState(0);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
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

  const redefinirSenha = async () => {
    if (!novaSenha.trim()) {
      alert('Por favor, digite uma nova senha.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/funcionarios/${usuario.id}/alterar-senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha }),
      });

      if (response.ok) {
        alert('Senha alterada com sucesso!');
        setNovaSenha('');
        setShowPerfilModal(false);
      } else {
        alert('Erro ao alterar senha.');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha.');
    }
  };

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
          <li className="menu-item" onClick={() => setShowPerfilModal(true)}>Editar Perfil</li>
          <li className="menu-item sair" onClick={() => navigate('/login')}>Sair</li>
        </ul>
      </div>

      {/* Conteúdo Principal */}
      <div className="conteudo-principal">
        <h1>Bem-vindo(a) {usuario?.nome || ''}!</h1>
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

      {/* Modal de Edição de Perfil */}
      {showPerfilModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Perfil do Usuário</h2>

            <div className="input-group">
              <label>Nome:</label>
              <input type="text" value={usuario?.nome || ''} readOnly className="input" />
            </div>

            <div className="input-group">
              <label>Nova Senha:</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="input"
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="modal-buttons" style={{ marginTop: '20px' }}>
              <button className="button" onClick={redefinirSenha}>
                Alterar Senha
              </button>
              <button
                className="button cancelar"
                onClick={() => {
                  setShowPerfilModal(false);
                  setNovaSenha('');
                }}
                style={{ marginLeft: '10px' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeFunc;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FazerPedido.css';

function FazerPedido() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [total, setTotal] = useState(0);
  const [termoBusca, setTermoBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [cliente, setCliente] = useState({
    nome: '',
    endereco: '',
    tipoEntrega: 'retirada',
    formaPagamento: 'pix'
  });
  const [outroPagamento, setOutroPagamento] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [observacaoItem, setObservacaoItem] = useState('');
  const [observacaoPedido, setObservacaoPedido] = useState('');



  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

    const handleFinalizarClick = () => {
        if (itensSelecionados.length === 0) {
        alert("Selecione pelo menos um item.");
        return;
        }
        setShowClienteModal(true);
    };

    const handleClienteChange = (e) => {
        const { name, value } = e.target;
        setCliente(prev => ({
        ...prev,
        [name]: value
        }));
    };

  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade <= 0) return;

    const itemExistente = itensSelecionados.find(item => item.id === produtoSelecionado.id);

    if (itemExistente) {
      const novaLista = itensSelecionados.map(item =>
        item.id === produtoSelecionado.id
          ? { 
              ...item, 
              quantidade: item.quantidade + quantidade,
              observacao: observacaoItem || item.observacao
            }
          : item
      );
      setItensSelecionados(novaLista);
    } else {
      setItensSelecionados([
        ...itensSelecionados, 
        { 
          ...produtoSelecionado, 
          quantidade,
          observacao: observacaoItem 
        }
      ]);
    }

    setProdutoSelecionado(null);
    setQuantidade(1);
    setObservacaoItem('');
    calcularTotal([...itensSelecionados, { ...produtoSelecionado, quantidade }]);
  };

    const removerItem = (id) => {
        if (window.confirm('Tem certeza que deseja remover este item do pedido?')) {
            const novaLista = itensSelecionados.filter(item => item.id !== id);
            setItensSelecionados(novaLista);
            calcularTotal(novaLista);
        }
    };

    const calcularTotal = (lista) => {
        const soma = lista.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        setTotal(soma);
    };

    const enviarPedido = async () => {
        // Validações mantidas
        if (!cliente.nome) {
            alert("Por favor, informe o nome do cliente.");
            return;
        }
        if (cliente.tipoEntrega === 'entrega' && !cliente.endereco) {
            alert("Por favor, informe o endereço para entrega.");
            return;
        }

        // Ajuste para o formato que o backend espera
            const pedido = {
                funcionario_id: usuario.id,
                produtos: itensSelecionados.map(item => ({
                    id: item.id,
                    quantidade: item.quantidade,
                    observacao: item.observacao || null
                })),
                total: total,
                nome: cliente.nome,
                endereco: cliente.tipoEntrega === 'entrega' ? cliente.endereco : null,
                forma_pagamento: cliente.formaPagamento === 'outro' ? outroPagamento : cliente.formaPagamento,
                data_hora_local: new Date().toISOString(), // Adiciona data/hora atual do cliente
                observacao: observacaoPedido || null
            };

            try {
                const response = await fetch('http://localhost:5000/api/pedidos', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(pedido)
                });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || 'Erro ao enviar pedido');
            }

            const data = await response.json();
            alert(`Pedido #${data.pedido_id} finalizado com sucesso!`);
            
            // Resetar estados
            setItensSelecionados([]);
            setTotal(0);
            setCliente({
                nome: '',
                endereco: '',
                tipoEntrega: 'retirada',
                formaPagamento: 'pix'
            });
            setShowClienteModal(false);
            
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    };

  // Agrupa produtos por tipo
  const produtosPorTipo = produtos.reduce((acc, produto) => {
    if (!produto.nome.toLowerCase().includes(termoBusca.toLowerCase())) return acc;
    
    if (!acc[produto.tipo]) acc[produto.tipo] = [];
    acc[produto.tipo].push(produto);
    return acc;
  }, {});

  return (
    <div className="pedido-container">
      <div className="pedido-header">
        <h2>Fazer Pedido</h2>
        <button className="button voltar" onClick={() => navigate('/funcionario')}>Voltar</button>
      </div>

      <div className="pedido-area">
        {/* LADO ESQUERDO: BUSCA E LISTA DE PRODUTOS */}
        <div className="busca-produtos">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="search-input"
          />

          <div className="lista-produtos">
            {Object.keys(produtosPorTipo).length > 0 ? (
              Object.entries(produtosPorTipo).map(([tipo, produtos]) => (
                <div key={tipo} className="tipo-section">
                  <h3>{tipo}</h3>
                  <div className="coluna-produtos">
                    {produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="produto-item"
                        onClick={() => setProdutoSelecionado(produto)}
                      >
                        <div>
                          <h4>{produto.nome}</h4>
                          <p>{produto.descricao}</p>
                        </div>
                        <span>R$ {produto.preco.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="mensagem-busca">Nenhum produto encontrado</p>
            )}
          </div>
        </div>

          {/* LADO DIREITO: ITENS SELECIONADOS */}
          <div className="itens-selecionados">
            <h3>Itens do Pedido</h3>
            {itensSelecionados.length === 0 ? (
              <p className="mensagem-lista">Nenhum item selecionado</p>
            ) : (
              <ul className="lista-itens">
                {itensSelecionados.map((item) => (
                  <li key={item.id} className="item-pedido">
                    <div className="item-info">
                      <div className="item-header">
                        <span><b>{item.nome} ({item.tipo})</b></span>
                        <small> - R$ {item.preco.toFixed(2)} x {item.quantidade}</small>
                      </div>
                      {item.observacao && (
                        <div className="item-observacao">
                          <small>Obs: {item.observacao}</small>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removerItem(item.id)}>Remover</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="total-pedido">
              <h3>Total: R$ {total.toFixed(2)}</h3>
              <button className="button enviar" onClick={handleFinalizarClick}>
                Finalizar Pedido
              </button>
            </div>
          </div>
      </div>

      {/* MODAL DE QUANTIDADE */}
      {produtoSelecionado && (
        <div className="modal-quantidade">
          <div className="modal-content">
            <h3>{produtoSelecionado.nome} ({produtoSelecionado.tipo})</h3>
            <p>R$ {produtoSelecionado.preco.toFixed(2)}</p>
            <div className="quantidade-controle">
              <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
              <span>{quantidade}</span>
              <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
            </div>
            
            {/* Novo campo de observação */}
            <div className="form-group">
              <label>Observações:</label>
              <textarea
                value={observacaoItem}
                onChange={(e) => setObservacaoItem(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne, etc."
                rows={2}
              />
            </div>
            
            <div className="modal-buttons">
              <button onClick={() => {
                setProdutoSelecionado(null);
                setObservacaoItem('');
              }}>Cancelar</button>
              <button onClick={adicionarItem}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INFORMAÇÕES DO CLIENTE */}
      {showClienteModal && (
        <div className="modal-quantidade">
          <div className="modal-content cliente-modal">
            <h3>Informações do Cliente</h3>
            
            <div className="form-group">
              <label>Nome:</label>
              <input 
                type="text" 
                name="nome" 
                value={cliente.nome} 
                onChange={handleClienteChange} 
                required 
                placeholder="Nome do cliente"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Entrega:</label>
              <select 
                name="tipoEntrega" 
                value={cliente.tipoEntrega} 
                onChange={handleClienteChange}
              >
                <option value="retirada">Retirada no Local</option>
                <option value="entrega">Entrega</option>
              </select>
            </div>

            {cliente.tipoEntrega === 'entrega' && (
              <div className="form-group">
                <label>Endereço:</label>
                <input 
                  type="text" 
                  name="endereco" 
                  value={cliente.endereco} 
                  onChange={handleClienteChange} 
                  required 
                  placeholder="Rua, número, bairro"
                />
              </div>
            )}

            <div className="form-group">
              <label>Forma de Pagamento:</label>
              <select 
                name="formaPagamento" 
                value={cliente.formaPagamento} 
                onChange={handleClienteChange}
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Pagamento na Entrega</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          

            {cliente.formaPagamento === 'outro' && (
              <div className="form-group">
                <label>Especificar:</label>
                <input 
                  type="text" 
                  value={outroPagamento} 
                  onChange={(e) => setOutroPagamento(e.target.value)} 
                  required 
                  placeholder="Informe a forma de pagamento"
                />
              </div>
            )}

            <div className="form-group">
                <label>Observações Gerais do Pedido:</label>
                <textarea
                    value={observacaoPedido}
                    onChange={(e) => setObservacaoPedido(e.target.value)}
                    placeholder="Ex: Pedido urgente, embalagem especial, etc."
                    rows={3}
                />
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowClienteModal(false)}>Cancelar</button>
              <button onClick={enviarPedido}>Confirmar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FazerPedido;
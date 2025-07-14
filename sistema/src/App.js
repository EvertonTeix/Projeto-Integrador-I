import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import HomeAdmin from './components/HomeAdmin';
import HomeFunc from './components/HomeFunc';
import Cardapio from './components/Cardapio';
import Vendas from './components/Vendas';
import FazerPedido from './components/FazerPedido';
import ConsultarCardapio from './components/ConsultarCardapio';
import CadastrarFuncionario from './components/CadastrarFuncionario';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<HomeAdmin />} />
                <Route path="/funcionario" element={<HomeFunc />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/funcionarios" element={<CadastrarFuncionario />} />
                <Route path="/fazer-pedido" element={<FazerPedido />} /> 
                <Route path="/consultar-cardapio" element={<ConsultarCardapio />} /> 
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
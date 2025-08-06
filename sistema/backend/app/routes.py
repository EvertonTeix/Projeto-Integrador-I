from flask import Blueprint, jsonify, request
from . import db
from .models import Usuario, Produto, Tipos, Pedido, ItemPedido
import hashlib
from datetime import datetime
from flask import request, jsonify
from escpos.printer import Usb
from datetime import datetime
from zoneinfo import ZoneInfo  # Requer Python 3.9+

main_routes = Blueprint('main', __name__)

@main_routes.route('/api/cadastrar-funcionario', methods=['POST'])
def cadastrar_funcionario():
    try:
        if not request.is_json:
            return jsonify({"mensagem": "O cabeçalho Content-Type deve ser application/json."}), 415

        dados = request.json
        print("Dados recebidos:", dados)

        nome = dados.get('nome')
        email = dados.get('email')
        senha = dados.get('senha')

        if not nome or not email or not senha:
            return jsonify({"mensagem": "Todos os campos são obrigatórios."}), 400

        usuario_existente = Usuario.query.filter_by(email=email).first()
        if usuario_existente:
            return jsonify({"mensagem": "E-mail já cadastrado."}), 400

        # Criptografa a senha
        senha_criptografada = hashlib.sha256(senha.encode()).hexdigest()

        # Cria um novo usuário do tipo 'funcionario'
        novo_funcionario = Usuario(nome=nome, email=email, senha=senha_criptografada, tipo='funcionario')
        db.session.add(novo_funcionario)
        db.session.commit()

        return jsonify({"mensagem": "Funcionário cadastrado com sucesso!"}), 201

    except Exception as e:
        print("Erro ao cadastrar funcionário:", str(e))  # Log para depuração
        return jsonify({"mensagem": "Erro interno do servidor."}), 500

@main_routes.route('/api/funcionarios', methods=['GET'])
def listar_funcionarios():
    try:
        # Filtra os usuários pelo tipo 'funcionario'
        funcionarios = Usuario.query.filter_by(tipo='funcionario').all()

        # Converte a lista de funcionários para JSON
        funcionarios_json = [
            {
                "id": funcionario.id,
                "nome": funcionario.nome,
                "email": funcionario.email,
                "tipo": funcionario.tipo
            }
            for funcionario in funcionarios
        ]

        # Retorna a lista de funcionários
        return jsonify(funcionarios_json), 200

    except Exception as e:
        print("Erro ao listar funcionários:", str(e))  # Log para depuração
        return jsonify({"mensagem": "Erro ao listar funcionários."}), 500
    
# Rota de login
@main_routes.route('/api/login', methods=['POST'])
def login():
    dados = request.json
    email = dados.get('email')
    senha = dados.get('senha')

    # Criptografa a senha enviada pelo front-end
    senha_criptografada = hashlib.sha256(senha.encode()).hexdigest()

    # Busca o usuário no banco de dados
    usuario = Usuario.query.filter_by(email=email, senha=senha_criptografada).first()

    if usuario:
        return jsonify({
            "mensagem": "Login bem-sucedido!",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "tipo": usuario.tipo  # 'admin' ou 'funcionario'
            }
        }), 200
    else:
        return jsonify({"mensagem": "E-mail ou senha incorretos."}), 401

# Rota para testar a conexão com o banco de dados
@main_routes.route('/api/testar-conexao', methods=['GET'])
def testar_conexao():
    try:
        # Tenta executar uma consulta simples
        resultado = db.session.execute(db.text("SELECT 1")).scalar()
        return jsonify({"mensagem": "Conexão com o banco de dados bem-sucedida!"}), 200
    except Exception as e:
        return jsonify({"mensagem": f"Erro ao conectar ao banco de dados: {str(e)}"}), 500
    
@main_routes.route('/api/produtos', methods=['POST'])
def adicionar_produto():
    dados = request.json
    try:
        novo_produto = Produto(
            nome=dados['nome'],
            descricao=dados.get('descricao', ''),
            preco=dados['preco'],
            tipo=dados['tipo']
        )
        db.session.add(novo_produto)
        db.session.commit()
        
        # Retorna o produto criado com status 201
        return jsonify({
            "id": novo_produto.id,
            "nome": novo_produto.nome,
            "descricao": novo_produto.descricao,
            "preco": novo_produto.preco,
            "tipo": novo_produto.tipo
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": f"Erro ao adicionar produto: {str(e)}"}), 500

# Rota para listar todos os produtos
@main_routes.route('/api/produtos', methods=['GET'])
def listar_produtos():
    produtos = Produto.query.all()
    return jsonify([{
        "id": p.id,
        "nome": p.nome,
        "descricao": p.descricao,
        "preco": p.preco,
        "tipo": p.tipo
    } for p in produtos]), 200

#Remover produtos
@main_routes.route('/api/produtos/<int:id>', methods=['DELETE'])
def deletar_produto(id):
    try:
        # Busca o produto pelo ID
        produto = Produto.query.get(id)
        if not produto:
            return jsonify({"mensagem": "Produto não encontrado."}), 404

        # Remove o produto do banco de dados
        db.session.delete(produto)
        db.session.commit()

        return jsonify({"mensagem": "Produto deletado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao deletar produto.", "erro": str(e)}), 500

@main_routes.route('/api/produtos/<int:id>', methods=['PUT'])
def editar_produto(id):
    try:
        # Busca o produto pelo ID
        produto = Produto.query.get(id)
        if not produto:
            return jsonify({"mensagem": "Produto não encontrado."}), 404

        dados = request.json

        # Atualiza os campos do produto
        if 'nome' in dados:
            produto.nome = dados['nome']
        if 'descricao' in dados:
            produto.descricao = dados['descricao']
        if 'preco' in dados:
            produto.preco = dados['preco']
        if 'tipo' in dados:
            produto.tipo = dados['tipo']

        # Salva as alterações no banco de dados
        db.session.commit()

        # Retorna o objeto completo atualizado no mesmo formato da rota GET
        return jsonify({
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco": produto.preco,
            "tipo": produto.tipo
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao atualizar produto.", "erro": str(e)}), 500

@main_routes.route('/api/tipos', methods=['POST'])
def adicionar_tipo():
    dados = request.json

    if 'nome' not in dados:
        return jsonify({"mensagem": "O campo 'nome' é obrigatório!"}), 400

    nome = dados['nome'].strip()

    if not nome:
        return jsonify({"mensagem": "O campo 'nome' não pode estar vazio!"}), 400

    try:
        tipo_existente = Tipos.query.filter_by(nome=nome).first()
        if tipo_existente:
            return jsonify({"mensagem": "Este tipo já existe!"}), 409

        novo_tipo = Tipos(nome=nome)
        db.session.add(novo_tipo)
        db.session.commit()

        # Retorna o objeto completo do tipo criado
        return jsonify({
            "id": novo_tipo.id,
            "nome": novo_tipo.nome
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao adicionar tipo.", "erro": str(e)}), 500
    
@main_routes.route('/api/tipos', methods=['GET'])
def listar_tipos():
    try:
        # Busca todos os tipos no banco de dados
        tipos = Tipos.query.all()
        # Converte a lista de tipos para um formato JSON
        tipos_json = [{"id": tipo.id, "nome": tipo.nome} for tipo in tipos]
        return jsonify(tipos_json), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao listar tipos.", "erro": str(e)}), 500

from datetime import datetime
from zoneinfo import ZoneInfo  # Python 3.9+
from flask import jsonify, request
from sqlalchemy.exc import SQLAlchemyError

@main_routes.route('/api/pedidos', methods=['POST'])
def fazer_pedido():
    try:
        # Verificação básica do content-type
        if not request.is_json:
            return jsonify({"mensagem": "O cabeçalho Content-Type deve ser application/json."}), 415

        dados = request.json

        # Validação dos campos obrigatórios
        campos_obrigatorios = {
            'funcionario_id': 'ID do funcionário',
            'produtos': 'Lista de produtos',
            'total': 'Valor total',
            'nome': 'Nome do cliente',
            'forma_pagamento': 'Forma de pagamento'
        }

        faltantes = [campo for campo, desc in campos_obrigatorios.items() if campo not in dados or dados[campo] is None]
        if faltantes:
            return jsonify({
                "mensagem": "Campos obrigatórios ausentes.",
                "campos_faltantes": faltantes
            }), 400

        # Tratamento da data/hora
        data_hora = (
            datetime.fromisoformat(dados['data_hora']) 
            if 'data_hora' in dados and dados['data_hora']
            else datetime.now(ZoneInfo("America/Sao_Paulo"))
        )

        # Criação do pedido (com observação)
        novo_pedido = Pedido(
            funcionario_id=dados['funcionario_id'],
            total=float(dados['total']),
            nome=dados['nome'],
            endereco=dados.get('endereco'),
            forma_pagamento=dados['forma_pagamento'],
            data_hora=data_hora,
            observacao=dados.get('observacao')  # Nova linha para a observação geral
        )

        db.session.add(novo_pedido)
        db.session.flush()

        # Adição dos itens do pedido (com observação)
        for item in dados['produtos']:
            if not all(k in item for k in ['id', 'quantidade']):
                db.session.rollback()
                return jsonify({"mensagem": "Item de pedido inválido."}), 400

            produto = Produto.query.get(item['id'])
            if not produto:
                db.session.rollback()
                return jsonify({"mensagem": f"Produto com ID {item['id']} não encontrado."}), 404

            novo_item = ItemPedido(
                pedido_id=novo_pedido.id,
                produto_id=produto.id,
                quantidade=item['quantidade'],
                preco_unitario=produto.preco,
                observacao=item.get('observacao')  # Campo de observação do item
            )
            db.session.add(novo_item)

        db.session.commit()

        return jsonify({
            "mensagem": "Pedido realizado com sucesso!",
            "pedido_id": novo_pedido.id,
            "data_hora": data_hora.isoformat()
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"mensagem": f"Erro de formato: {str(e)}"}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro no banco de dados.", "erro": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro interno no servidor.", "erro": str(e)}), 500

@main_routes.route('/api/pedidos-completos', methods=['GET'])
def listar_pedidos_completos():
    try:
        pedidos = Pedido.query.order_by(Pedido.data_hora).all()
        pedidos_json = []

        for pedido in pedidos:
            itens_pedido = ItemPedido.query.filter_by(pedido_id=pedido.id).all()
            itens = []
            total_esfihas = 0
            total_pizzas = 0

            for item in itens_pedido:
                produto = Produto.query.filter_by(id=item.produto_id).first()
                if not produto:
                    continue  # ou retorne erro

                tipo_normalizado = produto.tipo.strip().lower()


                itens.append({
                    "tipo": produto.tipo,
                    "nome": produto.nome,
                    "quantidade": item.quantidade,
                    "preco_unitario": item.preco_unitario,
                    "subtotal": round(item.quantidade * item.preco_unitario, 2),
                    "observacao": item.observacao  # Observação do item
                })

                if tipo_normalizado == "pizzas":
                    total_pizzas += item.quantidade
                elif tipo_normalizado == "esfihas":
                    total_esfihas += item.quantidade

            pedidos_json.append({
                "id": pedido.id,
                "data_hora": pedido.data_hora.strftime("%d/%m/%Y %H:%M"),
                "nome_cliente": pedido.nome,
                "endereco": pedido.endereco,
                "forma_pagamento": pedido.forma_pagamento,
                "observacao_pedido": pedido.observacao,
                "total": round(pedido.total, 2),
                "total_esfihas": total_esfihas,
                "total_pizzas": total_pizzas,
                "itens": itens
            })


        return jsonify(pedidos_json), 200

    except Exception as e:
        print("Erro ao listar pedidos completos:", str(e))
        return jsonify({"mensagem": "Erro ao listar pedidos."}), 500


@main_routes.route('/api/vendas/hoje', methods=['GET'])
def vendas_do_dia():
    try:
        hoje = datetime.utcnow().date()  # Data de hoje no formato UTC

        # Filtra pedidos pela data de hoje (somente pedidos feitos hoje)
        pedidos_hoje = Pedido.query.filter(
            db.func.date(Pedido.data_hora) == hoje
        ).all()

        # Soma os totais dos pedidos de hoje
        total_vendas = sum(p.total for p in pedidos_hoje)

        return jsonify({"total": round(total_vendas, 2)}), 200
    except Exception as e:
        print("Erro ao calcular vendas do dia:", str(e))
        return jsonify({"mensagem": "Erro ao calcular vendas do dia."}), 500


@main_routes.route('/api/imprimir-recibo', methods=['POST'])
def imprimir_recibo():
    pedido = request.get_json()

    try:
        printer = Usb(0x0416, 0x5011)

        printer.set(align='center', bold=True, width=2, height=2)
        printer.text("Esfiharia Buon Gusto\n\n")

        printer.set(align='center', bold=False, width=1, height=1)
        printer.text(f"Pedido #{pedido['id']}\n")
        printer.text(f"Data: {pedido['data_hora']}\n")
        printer.text("-" * 42 + "\n")

        if 'nome_cliente' in pedido:
            printer.text(f"Cliente: {pedido['nome_cliente']}\n")

        if pedido.get('endereco'):
            printer.text(f"Endereço: {pedido['endereco']}\n")

        if pedido.get('forma_pagamento'):
            printer.text(f"Pagamento: {pedido['forma_pagamento']}\n")

        if pedido.get('observacao_pedido'):
            printer.text(f"Obs. do Pedido: {pedido['observacao_pedido']}\n")

        printer.text("-" * 42 + "\n")
        printer.set(align='left')

        for item in pedido['itens']:
            nome = f"{item['quantidade']}x {item['tipo']} de {item['nome']}"
            preco = f"R$ {item['preco_unitario']:.2f}  Sub: R$ {item['subtotal']:.2f}"
            printer.text(f"{nome}\n")
            printer.text(f"{preco}\n")
            if item.get('observacao'):
                printer.text(f"  Obs: {item['observacao']}\n")

        printer.text("-" * 42 + "\n")
        printer.text(f"Total de Esfihas: {pedido.get('total_esfihas', 0)}\n")
        printer.text(f"Total de Pizzas: {pedido.get('total_pizzas', 0)}\n")
        printer.text(f"TOTAL: R$ {pedido['total']:.2f}\n")
        printer.text("-" * 42 + "\n")

        printer.set(align='center')
        printer.text("Obrigado pela preferência!\n\n")
        printer.cut()

        return jsonify({"success": True, "message": "Recibo impresso com sucesso."}), 200

    except Exception as e:
        print("Erro na impressão:", e)
        return jsonify({"success": False, "message": "Erro ao imprimir recibo."}), 500


@main_routes.route('/funcionario/deletar/<int:id>', methods=['DELETE'])
def deletar_funcionario(id):
    try:
        # Busca o usuario pelo ID
        usuario = Usuario.query.get(id)
        if not usuario:
            return jsonify({"mensagem": "usuario não encontrado."}), 404

        # Remove o usuario do banco de dados
        db.session.delete(usuario)
        db.session.commit()

        return jsonify({"mensagem": "usuario deletado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao deletar usuario.", "erro": str(e)}), 500

    
@main_routes.route('/api/funcionarios/<int:id>/redefinir-senha', methods=['PUT'])
def redefinir_senha_funcionario(id):
    try:
        funcionario = Usuario.query.get(id)
        if not funcionario or funcionario.tipo != 'funcionario':
            return jsonify({"mensagem": "Funcionário não encontrado."}), 404

        nova_senha = 'funcionario123'
        funcionario.senha = hashlib.sha256(nova_senha.encode()).hexdigest()
        db.session.commit()
        return jsonify({"mensagem": f"Senha redefinida para: {nova_senha}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao redefinir senha.", "erro": str(e)}), 500

@main_routes.route('/api/funcionarios/<int:id>/alterar-senha', methods=['PUT'])
def alterar_senha_funcionario(id):
    try:
        funcionario = Usuario.query.get(id)
        if not funcionario or funcionario.tipo != 'funcionario':
            return jsonify({"mensagem": "Funcionário não encontrado."}), 404

        data = request.get_json()
        nova_senha = data.get('senha')

        if not nova_senha or len(nova_senha.strip()) == 0:
            return jsonify({"mensagem": "A nova senha é obrigatória."}), 400

        # Hash da nova senha (SHA256)
        funcionario.senha = hashlib.sha256(nova_senha.encode()).hexdigest()

        db.session.commit()
        return jsonify({"mensagem": "Senha alterada com sucesso."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao alterar senha.", "erro": str(e)}), 500
    

@main_routes.route('/api/tipos/<int:id>', methods=['PUT'])
def editar_tipo(id):
    try:
        tipo = Tipos.query.get(id)
        if not tipo:
            return jsonify({"mensagem": "Tipo não encontrado."}), 404

        dados = request.json

        if 'nome' not in dados:
            return jsonify({"mensagem": "O campo 'nome' é obrigatório!"}), 400

        novo_nome = dados['nome'].strip()

        if not novo_nome:
            return jsonify({"mensagem": "O campo 'nome' não pode estar vazio!"}), 400

        # Verifica se o nome já existe (excluindo o atual)
        if Tipos.query.filter(Tipos.nome == novo_nome, Tipos.id != id).first():
            return jsonify({"mensagem": "Este tipo já existe!"}), 409

        # Atualiza o nome
        tipo_antigo = tipo.nome
        tipo.nome = novo_nome
        db.session.commit()

        # Retorna o objeto completo atualizado no mesmo formato da rota GET
        return jsonify({
            "id": tipo.id,
            "nome": tipo.nome
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao atualizar tipo.", "erro": str(e)}), 500

# Rota para deletar um tipo existente
@main_routes.route('/api/tipos/<int:id>', methods=['DELETE'])
def deletar_tipo(id):
    try:
        # Busca o tipo pelo ID
        tipo = Tipos.query.get(id)
        if not tipo:
            return jsonify({"mensagem": "Tipo não encontrado."}), 404

        # Verifica se existem produtos associados a este tipo
        produtos_com_tipo = Produto.query.filter_by(tipo=tipo.nome).count()
        if produtos_com_tipo > 0:
            return jsonify({
                "mensagem": "Não é possível excluir este tipo pois existem produtos associados a ele.",
                "quantidade_produtos": produtos_com_tipo
            }), 400

        # Remove o tipo do banco de dados
        db.session.delete(tipo)
        db.session.commit()

        return jsonify({"mensagem": "Tipo deletado com sucesso!"}), 200

    except Exception as e:
        # Em caso de erro, faz rollback e retorna uma mensagem de erro
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao deletar tipo.", "erro": str(e)}), 500
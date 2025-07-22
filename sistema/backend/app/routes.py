from flask import Blueprint, jsonify, request
from . import db
from .models import Usuario, Produto, Tipos, Pedido, ItemPedido
import hashlib
from datetime import datetime

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
    
# Rota para adicionar um produto
@main_routes.route('/api/produtos', methods=['POST'])
def adicionar_produto():
    dados = request.json
    print("Dados recebidos:", dados)  # Log dos dados recebidos
    try:
        novo_produto = Produto(
            nome=dados['nome'],
            descricao=dados.get('descricao', ''),  # Descrição é opcional
            preco=dados['preco'],
            tipo=dados['tipo']
        )
        db.session.add(novo_produto)
        db.session.commit()
        return jsonify({"mensagem": "Produto adicionado com sucesso!"}), 201
    except Exception as e:
        print("Erro ao adicionar produto:", str(e))  # Log de erro
        return jsonify({"mensagem": "Erro ao adicionar produto"}), 500

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

#Editar produtos
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

        return jsonify({"mensagem": "Produto atualizado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensagem": "Erro ao atualizar produto.", "erro": str(e)}), 500

@main_routes.route('/api/tipos', methods=['POST'])
def adicionar_tipo():
    dados = request.json

    # Verifica se o campo 'nome' foi enviado no JSON
    if 'nome' not in dados:
        return jsonify({"mensagem": "O campo 'nome' é obrigatório!"}), 400

    nome = dados['nome'].strip()  # Remove espaços em branco no início e no final

    # Verifica se o nome não está vazio
    if not nome:
        return jsonify({"mensagem": "O campo 'nome' não pode estar vazio!"}), 400

    try:
        # Verifica se o tipo já existe no banco de dados
        tipo_existente = Tipos.query.filter_by(nome=nome).first()
        if tipo_existente:
            return jsonify({"mensagem": "Este tipo já existe!"}), 409

        # Cria um novo tipo
        novo_tipo = Tipos(nome=nome)

        # Adiciona e commita no banco de dados
        db.session.add(novo_tipo)
        db.session.commit()

        return jsonify({"mensagem": "Tipo adicionado com sucesso!", "id": novo_tipo.id}), 201

    except Exception as e:
        # Em caso de erro, faz rollback e retorna uma mensagem de erro
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



@main_routes.route('/api/pedidos', methods=['POST'])
def fazer_pedido():
    try:
        if not request.is_json:
            return jsonify({"mensagem": "O cabeçalho Content-Type deve ser application/json."}), 415

        dados = request.json

        funcionario_id = dados.get('funcionario_id')
        produtos = dados.get('produtos', [])
        total = dados.get('total')

        if not funcionario_id or not produtos or total is None:
            return jsonify({"mensagem": "Campos obrigatórios ausentes (funcionario_id, produtos, total)."}), 400

        # Cria o pedido
        novo_pedido = Pedido(
            funcionario_id=funcionario_id,
            data_hora=datetime.utcnow(),
            total=total
        )
        db.session.add(novo_pedido)
        db.session.flush()  # Garante que novo_pedido.id esteja disponível

        # Adiciona os itens do pedido
        for item in produtos:
            produto = Produto.query.get(item['id'])
            if not produto:
                continue  # ignora produtos inválidos

            item_pedido = ItemPedido(
                pedido_id=novo_pedido.id,
                produto_id=produto.id,
                quantidade=item.get('quantidade', 1),
                preco_unitario=produto.preco
            )
            db.session.add(item_pedido)

        db.session.commit()

        return jsonify({"mensagem": "Pedido realizado com sucesso!"}), 201

    except Exception as e:
        db.session.rollback()
        print("Erro ao fazer pedido:", str(e))
        return jsonify({"mensagem": "Erro ao fazer pedido.", "erro": str(e)}), 500

@main_routes.route('/api/pedidos/funcionario/<int:funcionario_id>', methods=['GET'])
def pedidos_por_funcionario(funcionario_id):
    try:
        pedidos = Pedido.query.filter_by(funcionario_id=funcionario_id).all()
        pedidos_json = [{
            "id": p.id,
            "data_hora": p.data_hora,
            "total": p.total
        } for p in pedidos]
        return jsonify(pedidos_json), 200
    except Exception as e:
        return jsonify({"mensagem": "Erro ao buscar pedidos.", "erro": str(e)}), 500


@main_routes.route('/api/pedidos-completos', methods=['GET'])
def listar_pedidos_completos():
    try:
        pedidos = Pedido.query.order_by(Pedido.data_hora).all()
        pedidos_json = []
        for pedido in pedidos:
            itens = []
            for item in pedido.itens:
                itens.append({
                    "produto": item.produto.nome,
                    "quantidade": item.quantidade,
                    "preco_unitario": item.preco_unitario,
                    "subtotal": round(item.quantidade * item.preco_unitario, 2)
                })

            pedidos_json.append({
                "id": pedido.id,
                "data_hora": pedido.data_hora.strftime("%d/%m/%Y %H:%M"),
                "funcionario": pedido.funcionario.nome,
                "total": round(pedido.total, 2),
                "itens": itens
            })

        return jsonify(pedidos_json), 200
    except Exception as e:
        print("Erro ao listar pedidos completos:", str(e))
        return jsonify({"mensagem": "Erro ao listar pedidos."}), 500


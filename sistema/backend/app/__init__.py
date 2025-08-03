from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Cria a instância do SQLAlchemy
db = SQLAlchemy()

def create_app():
    # Cria a instância do Flask
    app = Flask(__name__)
    CORS(app)

    # Configura o banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/sistema_vendas'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa o SQLAlchemy com a instância do Flask
    db.init_app(app)

    # Importa os modelos e rotas após a inicialização do SQLAlchemy
    from app import models, routes

    # Registra as rotas
    app.register_blueprint(routes.main_routes)

    return app
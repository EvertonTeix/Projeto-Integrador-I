from app import create_app, db

# Cria a aplicação Flask
app = create_app()

# Cria o contexto da aplicação e inicializa o banco
with app.app_context():
    db.create_all()
    print("Tabelas criadas com sucesso!")

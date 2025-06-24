from app import create_app

# Cria a aplicação Flask
app = create_app()

if __name__ == '__main__':
    # Executa a aplicação
    app.run(debug=True)
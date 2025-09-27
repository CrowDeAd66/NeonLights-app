from flask import Flask, render_template, jsonify, request, session, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Inicialização do Flask e CORS
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "neonlights_secret_key_2024_default")
CORS(app, supports_credentials=True)

# Configuração do Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_SERVICE_KEY:
    raise ValueError("As variáveis de ambiente SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_KEY devem ser definidas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("[Supabase] Cliente Supabase inicializado com sucesso.")

# Rota principal - servir o frontend
@app.route("/")
def index():
    return send_from_directory('static', 'index.html')

# Rota para servir arquivos estáticos do frontend
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# --- Autenticação ---

@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        username = data.get("username")

        if not all([email, password, username]):
            return jsonify({"error": "Email, senha e nome de usuário são obrigatórios"}), 400

        # Criar usuário no Supabase Auth
        user = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "username": username
                }
            }
        })

        # Criar sessão
        session["user_id"] = user.user.id
        session["username"] = user.user.user_metadata.get("username")
        session["email"] = user.user.email

        return jsonify({
            "message": "Usuário registrado com sucesso",
            "user": {
                "id": user.user.id,
                "username": user.user.user_metadata.get("username"),
                "email": user.user.email
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

        # Autenticar usuário com Supabase Auth
        user = supabase.auth.sign_in_with_password({"email": email, "password": password})

        # Criar sessão
        session["user_id"] = user.user.id
        session["username"] = user.user.user_metadata.get("username")
        session["email"] = user.user.email

        return jsonify({
            "message": "Login realizado com sucesso",
            "user": {
                "id": user.user.id,
                "username": user.user.user_metadata.get("username"),
                "email": user.user.email
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout realizado com sucesso"})

# --- Eventos ---

@app.route("/api/events", methods=["GET"])
def get_events():
    try:
        # Obter eventos da tabela "events" no Supabase
        response = supabase.table("events").select("*").execute()
        events = response.data

        return jsonify(events)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/events/categories", methods=["GET"])
def get_categories():
    categories = ["eletronica", "rock", "funk", "pop", "reggae", "hip-hop"]
    return jsonify(categories)

# --- Download ---

@app.route("/api/download/neonlights.apk", methods=["GET"])
def download_apk():
    try:
        # Simular download do APK
        return jsonify({
            "message": "Download do APK iniciado",
            "download_url": "/static/neonlights.apk",
            "version": "1.0.0",
            "size": "25.4 MB"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Execução do app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

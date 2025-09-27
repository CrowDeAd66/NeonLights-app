from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Inicialização do Flask e CORS
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "neonlights_secret_key_2024_default")
CORS(app, supports_credentials=True)

# Tentar configurar o Supabase
supabase = None
try:
    from supabase import create_client, Client
    
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

    if SUPABASE_URL and SUPABASE_KEY and SUPABASE_SERVICE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("[Supabase] Cliente Supabase inicializado com sucesso.")
    else:
        print("[Supabase] Variáveis de ambiente não encontradas. Usando dados de exemplo.")
except Exception as e:
    print(f"[Supabase] Erro ao inicializar Supabase: {e}. Usando dados de exemplo.")

# Rota principal - servir o frontend
@app.route("/")
def index():
    return send_from_directory('static', 'index.html')

# Rota para servir arquivos estáticos do frontend
@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('static', filename)
    except:
        return send_from_directory('static', 'index.html')

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

        if supabase:
            # Usar Supabase se disponível
            user = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "username": username
                    }
                }
            })

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
        else:
            # Usar dados de exemplo se Supabase não estiver disponível
            session["user_id"] = "demo-user-id"
            session["username"] = username
            session["email"] = email

            return jsonify({
                "message": "Usuário registrado com sucesso (demo)",
                "user": {
                    "id": "demo-user-id",
                    "username": username,
                    "email": email
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

        if supabase:
            # Usar Supabase se disponível
            user = supabase.auth.sign_in_with_password({"email": email, "password": password})

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
        else:
            # Usar dados de exemplo se Supabase não estiver disponível
            session["user_id"] = "demo-user-id"
            session["username"] = "demo"
            session["email"] = email

            return jsonify({
                "message": "Login realizado com sucesso (demo)",
                "user": {
                    "id": "demo-user-id",
                    "username": "demo",
                    "email": email
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
        if supabase:
            # Obter eventos da tabela "events" no Supabase
            response = supabase.table("events").select("*").execute()
            events = response.data
            return jsonify(events)
        else:
            # Usar dados de exemplo se Supabase não estiver disponível
            events = [
                {
                    "id": 1,
                    "name": "Festival de Música Eletrônica",
                    "category": "eletronica",
                    "date": "2024-10-15",
                    "location": "São Paulo, SP",
                    "description": "O maior festival de música eletrônica do Brasil"
                },
                {
                    "id": 2,
                    "name": "Rock in Rio",
                    "category": "rock",
                    "date": "2024-11-20",
                    "location": "Rio de Janeiro, RJ",
                    "description": "Festival internacional de rock"
                },
                {
                    "id": 3,
                    "name": "Baile Funk",
                    "category": "funk",
                    "date": "2024-12-05",
                    "location": "Rio de Janeiro, RJ",
                    "description": "A melhor festa funk da cidade"
                }
            ]
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
        return jsonify({
            "message": "Download do APK iniciado",
            "download_url": "/static/neonlights-demo.apk",
            "version": "1.0.0",
            "size": "25.4 MB"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check
@app.route("/health")
def health():
    status = {
        "status": "ok",
        "message": "NeonLights API is running",
        "supabase": "connected" if supabase else "demo mode"
    }
    return jsonify(status)

# Execução do app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

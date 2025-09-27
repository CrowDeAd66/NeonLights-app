from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

# Inicialização do Flask e CORS
app = Flask(__name__)
app.secret_key = "neonlights_secret_key_2024_production"
CORS(app, supports_credentials=True)

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

# --- API Routes ---

@app.route("/api/events", methods=["GET"])
def get_events():
    # Dados de exemplo para eventos
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

@app.route("/api/events/categories", methods=["GET"])
def get_categories():
    categories = ["eletronica", "rock", "funk", "pop", "reggae", "hip-hop"]
    return jsonify(categories)

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    return jsonify({
        "message": "Usuário registrado com sucesso (demo)",
        "user": {
            "id": "demo-user-id",
            "username": data.get("username", "demo"),
            "email": data.get("email", "demo@example.com")
        }
    })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    return jsonify({
        "message": "Login realizado com sucesso (demo)",
        "user": {
            "id": "demo-user-id",
            "username": "demo",
            "email": data.get("email", "demo@example.com")
        }
    })

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logout realizado com sucesso"})

@app.route("/api/download/neonlights.apk", methods=["GET"])
def download_apk():
    return jsonify({
        "message": "Download do APK iniciado",
        "download_url": "/static/neonlights-demo.apk",
        "version": "1.0.0",
        "size": "25.4 MB"
    })

# Health check
@app.route("/health")
def health():
    return jsonify({"status": "ok", "message": "NeonLights API is running"})

# Execução do app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

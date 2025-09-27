from flask import Flask, render_template, jsonify, request, session, send_file
from flask_cors import CORS
import sqlite3
import hashlib
import uuid
from datetime import datetime, date
import os
import json

app = Flask(__name__)
app.secret_key = 'neonlights_secret_key_2024'
CORS(app, supports_credentials=True)

# Configuração do banco de dados SQLite
DATABASE = 'neonlights.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    # Criar tabela de usuários
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Criar tabela de eventos
    conn.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            category TEXT NOT NULL,
            image_url TEXT,
            price REAL,
            age_restriction TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Inserir eventos de exemplo se a tabela estiver vazia
    cursor = conn.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        # Usar um user_id fictício para eventos de exemplo, já que não temos usuários ainda
        # Em um cenário real, isso seria associado a um usuário existente
        fictitious_user_id = str(uuid.uuid4())
        conn.execute("INSERT OR IGNORE INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)", 
                     (fictitious_user_id, 'admin_eventos', 'admin@example.com', hash_password('admin123')))

        conn.execute('''
            INSERT INTO events (id, user_id, title, description, date, time, location, latitude, longitude, category, image_url, price, age_restriction)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()), fictitious_user_id, 'Open da Cucko', 'A festa mais insana de Porto Alegre com muito funk e open bar a noite toda! Prepare-se para a loucurada. Lote 1: R$ 65,00, Lote 2: R$ 75,00, Lote 3: R$ 85,00.', '2025-10-20', '23:00', 'Porto Alegre, RS', -30.0346, -51.2177, 'funk', '/static/images/events/open_da_cucko.jpg', 65.00, '18+',
            str(uuid.uuid4()), fictitious_user_id, 'Baile Emo', 'Reviva a era emo com os maiores hits do rock alternativo e punk rock. Muito choro e muito mosh! Lote 1: R$ 90,00, Lote 2: R$ 100,00, Lote 3: R$ 110,00.', '2025-10-25', '22:00', 'São Paulo, SP', -23.5505, -46.6333, 'rock', '/static/images/events/baile_emo.jpg', 90.00, '18+',
            str(uuid.uuid4()), fictitious_user_id, 'Orion Festival', 'O maior festival de música eletrônica da região! DJs renomados, visuais incríveis e uma experiência sonora inesquecível. Passaporte (7 dias): Lote 1: R$ 180,00, Lote 2: R$ 210,00, Lote 3: R$ 240,00.', '2025-11-10', '18:00', 'Rio de Janeiro, RJ', -22.9068, -43.1729, 'eletronica', '/static/images/events/orion_festival.jpg', 180.00, '18+'
        ))
    
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Inicializar banco de dados
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
        
        conn = get_db_connection()
        
        # Verificar se usuário já existe
        existing_user = conn.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            (email, username)
        ).fetchone()
        
        if existing_user:
            return jsonify({'error': 'Usuário ou email já existe'}), 400
        
        # Criar novo usuário
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        conn.execute(
            'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
            (user_id, username, email, password_hash)
        )
        conn.commit()
        conn.close()
        
        # Criar sessão
        session['user_id'] = user_id
        session['username'] = username
        session['email'] = email
        
        return jsonify({
            'message': 'Usuário registrado com sucesso',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        conn.close()
        
        if not user or user['password_hash'] != hash_password(password):
            return jsonify({'error': 'Email ou senha incorretos'}), 401
        
        # Criar sessão
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['email'] = user['email']
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout realizado com sucesso'})

@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        conn = get_db_connection()
        events = conn.execute('''
            SELECT e.*, u.username as creator_username
            FROM events e
            JOIN users u ON e.user_id = u.id
            ORDER BY e.created_at DESC
        ''').fetchall()
        conn.close()
        
        events_list = []
        for event in events:
            event_dict = dict(event)
            events_list.append(event_dict)
        
        return jsonify(events_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/categories', methods=['GET'])
def get_categories():
    categories = ['eletronica', 'rock', 'funk', 'pop', 'reggae', 'hip-hop']
    return jsonify(categories)

@app.route('/api/download/neonlights.apk', methods=['GET'])
def download_apk():
    try:
        # Simular download do APK
        return jsonify({
            'message': 'Download do APK iniciado',
            'download_url': '/static/neonlights.apk',
            'version': '1.0.0',
            'size': '25.4 MB'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


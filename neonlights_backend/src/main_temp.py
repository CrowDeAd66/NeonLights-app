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
    categories = ['eletronica', 'rock', 'sertanejo', 'funk', 'pop', 'reggae', 'hip-hop']
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

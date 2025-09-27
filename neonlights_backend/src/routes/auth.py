from flask import Blueprint, jsonify, request, session, redirect, url_for
from src.supabase_config import supabase
from src.models.user import User # Ainda usaremos o modelo User para consistência, mas ele interagirá com o Supabase
import re

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        username = data.get("username")

        if not email or not password or not username:
            return jsonify({"error": "Email, password e username são obrigatórios"}), 400

        # Tenta registrar no Supabase Auth
        response = supabase.auth.sign_up({"email": email, "password": password})

        if response.user:
            # Se o registro for bem-sucedido, armazena o username no banco de dados do Supabase
            # Isso é opcional, mas útil para ter o username associado ao usuário
            supabase.from_("users").insert({"id": response.user.id, "email": email, "username": username}).execute()
            return jsonify({"message": "Usuário registrado com sucesso! Verifique seu email para confirmar.", "user": {"id": response.user.id, "email": response.user.email, "username": username}}), 201
        else:
            return jsonify({"error": response.get("error", "Erro ao registrar usuário")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email e password são obrigatórios"}), 400

        response = supabase.auth.sign_in_with_password({"email": email, "password": password})

        if response.user:
            # Opcional: buscar o username do nosso banco de dados de usuários
            user_data = supabase.from_("users").select("username").eq("id", response.user.id).single().execute().data
            username = user_data["username"] if user_data else response.user.email.split("@")[0]

            session["user_id"] = response.user.id
            session["username"] = username
            session["access_token"] = response.session.access_token

            return jsonify({"message": "Login realizado com sucesso!", "user": {"id": response.user.id, "email": response.user.email, "username": username}}), 200
        else:
            return jsonify({"error": response.get("error", "Email ou senha incorretos")}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    try:
        access_token = session.get("access_token")
        if access_token:
            supabase.auth.sign_out(access_token)
        session.clear()
        return jsonify({"message": "Logout realizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    try:
        access_token = session.get("access_token")
        if not access_token:
            return jsonify({"error": "Usuário não autenticado"}), 401

        user_response = supabase.auth.get_user(access_token)
        user = user_response.user

        if user:
            user_data = supabase.from_("users").select("username").eq("id", user.id).single().execute().data
            username = user_data["username"] if user_data else user.email.split("@")[0]
            return jsonify({"user": {"id": user.id, "email": user.email, "username": username}}), 200
        else:
            session.clear()
            return jsonify({"error": "Usuário não encontrado ou sessão inválida"}), 401
    except Exception as e:
        session.clear()
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/check-auth", methods=["GET"])
def check_auth():
    try:
        access_token = session.get("access_token")
        if access_token:
            user_response = supabase.auth.get_user(access_token)
            if user_response.user:
                user = user_response.user
                user_data = supabase.from_("users").select("username").eq("id", user.id).single().execute().data
                username = user_data["username"] if user_data else user.email.split("@")[0]
                return jsonify({"authenticated": True, "user": {"id": user.id, "email": user.email, "username": username}}), 200
        return jsonify({"authenticated": False}), 200
    except Exception as e:
        return jsonify({"authenticated": False, "error": str(e)}), 200

# Rotas para Social Login
@auth_bp.route("/oauth/google", methods=["GET"])
def oauth_google():
    return redirect(supabase.auth.sign_in_with_oauth({"provider": "google"}).url)

@auth_bp.route("/oauth/facebook", methods=["GET"])
def oauth_facebook():
    return redirect(supabase.auth.sign_in_with_oauth({"provider": "facebook"}).url)

@auth_bp.route("/oauth/spotify", methods=["GET"])
def oauth_spotify():
    return redirect(supabase.auth.sign_in_with_oauth({"provider": "spotify"}).url)

@auth_bp.route("/auth/callback", methods=["GET"])
def auth_callback():
    try:
        code = request.args.get("code")
        if not code:
            return jsonify({"error": "Código de autorização não encontrado"}), 400

        response = supabase.auth.exchange_code_for_session(code)

        if response.user:
            # Opcional: buscar o username do nosso banco de dados de usuários
            user_data = supabase.from_("users").select("username").eq("id", response.user.id).single().execute().data
            username = user_data["username"] if user_data else response.user.email.split("@")[0]

            session["user_id"] = response.user.id
            session["username"] = username
            session["access_token"] = response.session.access_token

            # Redirecionar para o frontend após o login bem-sucedido
            return redirect("/") # Redireciona para a página inicial do frontend
        else:
            return jsonify({"error": response.get("error", "Erro ao processar callback de autenticação")}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


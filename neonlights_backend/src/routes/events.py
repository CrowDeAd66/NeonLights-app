from flask import Blueprint, jsonify, request, session
from src.supabase_config import supabase
from src.models.event import Event # Usaremos o modelo Event para estruturar os dados
from src.models.user import User # Usaremos o modelo User para buscar o username
from datetime import datetime, date, time
import math

events_bp = Blueprint("events", __name__)

def require_auth():
    """Decorator para verificar autenticação via Supabase"""
    access_token = session.get("access_token")
    if not access_token:
        return jsonify({"error": "Autenticação necessária"}), 401
    
    try:
        user_response = supabase.auth.get_user(access_token)
        if not user_response.user:
            session.clear()
            return jsonify({"error": "Sessão inválida ou expirada"}), 401
        return None
    except Exception as e:
        session.clear()
        return jsonify({"error": f"Erro de autenticação: {str(e)}"}), 401

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calcula distância entre duas coordenadas em km"""
    if not all([lat1, lon1, lat2, lon2]):
        return float("inf")
    
    R = 6371  # Raio da Terra em km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

@events_bp.route("/events", methods=["GET"])
def get_events():
    try:
        category = request.args.get("category")
        lat = request.args.get("lat", type=float)
        lng = request.args.get("lng", type=float)
        radius = request.args.get("radius", default=50, type=float)  # km
        limit = request.args.get("limit", default=50, type=int)
        
        query = supabase.from_("events").select("*")
        
        if category and category != "all":
            query = query.eq("category", category)
        
        response = query.order("created_at", desc=True).limit(limit).execute()
        events_data = response.data
        
        events_list = []
        for event_data in events_data:
            # Buscar username do criador
            creator_response = supabase.from_("users").select("username").eq("id", event_data["user_id"]).single().execute()
            creator_username = creator_response.data["username"] if creator_response.data else "Desconhecido"
            
            event_obj = Event(**event_data)
            event_dict = event_obj.to_dict()
            event_dict["creator"] = creator_username
            
            if lat and lng and event_obj.latitude and event_obj.longitude:
                distance = calculate_distance(lat, lng, event_obj.latitude, event_obj.longitude)
                if distance <= radius:
                    event_dict["distance"] = round(distance, 2)
                    events_list.append(event_dict)
            elif not lat or not lng:
                events_list.append(event_dict)
        
        if lat and lng:
            events_list.sort(key=lambda x: x.get("distance", float("inf")))
            
        return jsonify(events_list), 200
        
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar eventos: {str(e)}"}), 500

@events_bp.route("/events", methods=["POST"])
def create_event():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        
        required_fields = ["title", "date", "time", "location", "category"]
        if not data or not all(k in data for k in required_fields):
            return jsonify({"error": "Campos obrigatórios: title, date, time, location, category"}), 400
        
        try:
            event_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            event_time = datetime.strptime(data["time"], "%H:%M").time()
        except ValueError:
            return jsonify({"error": "Formato de data/hora inválido. Use YYYY-MM-DD para data e HH:MM para hora"}), 400
        
        if event_date < date.today():
            return jsonify({"error": "Data do evento não pode ser no passado"}), 400
        
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "ID do usuário não encontrado na sessão"}), 401

        # Buscar username do criador
        creator_response = supabase.from_("users").select("username").eq("id", user_id).single().execute()
        creator_username = creator_response.data["username"] if creator_response.data else "Desconhecido"

        event_data = {
            "title": data["title"].strip(),
            "description": data.get("description", "").strip(),
            "date": event_date.isoformat(),
            "time": event_time.strftime("%H:%M"),
            "location": data["location"].strip(),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "category": data["category"].strip(),
            "image_url": data.get("image_url", "").strip() or None,
            "price": data.get("price"),
            "age_restriction": data.get("age_restriction", "").strip() or None,
            "user_id": user_id,
            "creator": creator_username,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.from_("events").insert(event_data).execute()
        
        if response.data:
            event_obj = Event(**response.data[0])
            return jsonify({
                "message": "Evento criado com sucesso",
                "event": event_obj.to_dict()
            }), 201
        else:
            return jsonify({"error": "Erro ao criar evento no Supabase"}), 500
        
    except Exception as e:
        return jsonify({"error": f"Erro ao criar evento: {str(e)}"}), 500

@events_bp.route("/events/<string:event_id>", methods=["GET"])
def get_event(event_id):
    try:
        response = supabase.from_("events").select("*").eq("id", event_id).single().execute()
        if response.data:
            event_obj = Event(**response.data)
            # Buscar username do criador
            creator_response = supabase.from_("users").select("username").eq("id", event_obj.user_id).single().execute()
            creator_username = creator_response.data["username"] if creator_response.data else "Desconhecido"
            event_dict = event_obj.to_dict()
            event_dict["creator"] = creator_username
            return jsonify(event_dict), 200
        return jsonify({"error": "Evento não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar evento: {str(e)}"}), 500

@events_bp.route("/events/<string:event_id>", methods=["PUT"])
def update_event(event_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        response = supabase.from_("events").select("*").eq("id", event_id).single().execute()
        if not response.data:
            return jsonify({"error": "Evento não encontrado"}), 404
        
        event_data = response.data
        
        user_id = session.get("user_id")
        if str(event_data["user_id"]) != str(user_id):
            return jsonify({"error": "Você só pode editar seus próprios eventos"}), 403
        
        data = request.json
        updated_fields = {}
        
        if "title" in data: updated_fields["title"] = data["title"].strip()
        if "description" in data: updated_fields["description"] = data["description"].strip()
        if "date" in data:
            try:
                updated_fields["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date().isoformat()
            except ValueError:
                return jsonify({"error": "Formato de data inválido. Use YYYY-MM-DD"}), 400
        if "time" in data:
            try:
                updated_fields["time"] = datetime.strptime(data["time"], "%H:%M").time().strftime("%H:%M")
            except ValueError:
                return jsonify({"error": "Formato de hora inválido. Use HH:MM"}), 400
        if "location" in data: updated_fields["location"] = data["location"].strip()
        if "latitude" in data: updated_fields["latitude"] = data["latitude"]
        if "longitude" in data: updated_fields["longitude"] = data["longitude"]
        if "category" in data: updated_fields["category"] = data["category"].strip()
        if "image_url" in data: updated_fields["image_url"] = data["image_url"].strip() or None
        if "price" in data: updated_fields["price"] = data["price"]
        if "age_restriction" in data: updated_fields["age_restriction"] = data["age_restriction"].strip() or None
        
        updated_fields["updated_at"] = datetime.utcnow().isoformat()
        
        update_response = supabase.from_("events").update(updated_fields).eq("id", event_id).execute()
        
        if update_response.data:
            event_obj = Event(**update_response.data[0])
            return jsonify({
                "message": "Evento atualizado com sucesso",
                "event": event_obj.to_dict()
            }), 200
        else:
            return jsonify({"error": "Erro ao atualizar evento no Supabase"}), 500
        
    except Exception as e:
        return jsonify({"error": f"Erro ao atualizar evento: {str(e)}"}), 500

@events_bp.route("/events/<string:event_id>", methods=["DELETE"])
def delete_event(event_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        response = supabase.from_("events").select("user_id").eq("id", event_id).single().execute()
        if not response.data:
            return jsonify({"error": "Evento não encontrado"}), 404
        
        event_user_id = response.data["user_id"]
        current_user_id = session.get("user_id")
        
        if str(event_user_id) != str(current_user_id):
            return jsonify({"error": "Você só pode deletar seus próprios eventos"}), 403
        
        delete_response = supabase.from_("events").delete().eq("id", event_id).execute()
        
        if delete_response.data:
            return jsonify({"message": "Evento deletado com sucesso"}), 200
        else:
            return jsonify({"error": "Erro ao deletar evento no Supabase"}), 500
        
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar evento: {str(e)}"}), 500

@events_bp.route("/my-events", methods=["GET"])
def get_my_events():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "ID do usuário não encontrado na sessão"}), 401

        response = supabase.from_("events").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        events_list = []
        for event_data in response.data:
            # Buscar username do criador
            creator_response = supabase.from_("users").select("username").eq("id", event_data["user_id"]).single().execute()
            creator_username = creator_response.data["username"] if creator_response.data else "Desconhecido"
            
            event_obj = Event(**event_data)
            event_dict = event_obj.to_dict()
            event_dict["creator"] = creator_username
            events_list.append(event_dict)

        return jsonify(events_list), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar seus eventos: {str(e)}"}), 500

@events_bp.route("/events/categories", methods=["GET"])
def get_categories():
    """Retorna as categorias disponíveis"""
    categories = [
        {"value": "eletronica", "label": "Eletrônica"},
        {"value": "rock", "label": "Rock"},
        {"value": "sertanejo", "label": "Sertanejo"},
        {"value": "funk", "label": "Funk"},
        {"value": "pop", "label": "Pop"},
        {"value": "jazz", "label": "Jazz"},
        {"value": "reggae", "label": "Reggae"},
        {"value": "hip-hop", "label": "Hip-Hop"},
        {"value": "outros", "label": "Outros"}
    ]
    return jsonify(categories), 200


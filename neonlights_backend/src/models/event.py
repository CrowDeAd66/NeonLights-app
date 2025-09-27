from src.supabase_config import supabase
from datetime import datetime

class Event:
    def __init__(self, id=None, title=None, description=None, date=None, time=None, location=None, 
                 latitude=None, longitude=None, category=None, image_url=None, price=None, 
                 age_restriction=None, user_id=None, creator=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.date = date
        self.time = time
        self.location = location
        self.latitude = latitude
        self.longitude = longitude
        self.category = category
        self.image_url = image_url
        self.price = price
        self.age_restriction = age_restriction
        self.user_id = user_id
        self.creator = creator # Username do criador
        self.created_at = created_at if created_at else datetime.utcnow().isoformat()
        self.updated_at = updated_at if updated_at else datetime.utcnow().isoformat()

    @staticmethod
    def get_all():
        response = supabase.from_("events").select("*").execute()
        return [Event(**data) for data in response.data]

    @staticmethod
    def get_by_id(event_id):
        response = supabase.from_("events").select("*").eq("id", event_id).execute()
        if response.data:
            return Event(**response.data[0])
        return None

    def save(self):
        if self.id:
            # Atualizar evento existente
            self.updated_at = datetime.utcnow().isoformat()
            response = supabase.from_("events").update(self.to_dict()).eq("id", self.id).execute()
        else:
            # Criar novo evento
            response = supabase.from_("events").insert(self.to_dict()).execute()
        if response.data:
            self.id = response.data[0]["id"]
            return self
        return None

    def delete(self):
        response = supabase.from_("events").delete().eq("id", self.id).execute()
        return response.data

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "category": self.category,
            "image_url": self.image_url,
            "price": self.price,
            "age_restriction": self.age_restriction,
            "user_id": self.user_id,
            "creator": self.creator,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


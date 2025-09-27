from src.supabase_config import supabase

class User:
    def __init__(self, id=None, email=None, username=None):
        self.id = id
        self.email = email
        self.username = username

    @staticmethod
    def get_by_email(email):
        response = supabase.from_("users").select("*").eq("email", email).execute()
        if response.data:
            user_data = response.data[0]
            return User(id=user_data["id"], email=user_data["email"], username=user_data["username"])
        return None

    @staticmethod
    def create(email, username):
        # Supabase Auth cuida da criação de usuários, aqui apenas para consistência se necessário
        # Em um cenário real, a criação de usuário seria via supabase.auth.sign_up
        response = supabase.from_("users").insert({"email": email, "username": username}).execute()
        if response.data:
            user_data = response.data[0]
            return User(id=user_data["id"], email=user_data["email"], username=user_data["username"])
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username
        }


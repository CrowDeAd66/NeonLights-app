from supabase import create_client, Client
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_SERVICE_KEY:
    raise ValueError("As variáveis de ambiente SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_KEY devem ser definidas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("[Supabase] Cliente Supabase inicializado com sucesso.")


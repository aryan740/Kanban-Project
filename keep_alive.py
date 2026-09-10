import os
import sys
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials missing!")
    sys.exit(1)

try:
    supabase = create_client(url, key)
    # Ping request
    response = supabase.table("users").select("id").limit(1).execute()
    print("Ping successful! Database is alive.")
except Exception as e:
    print(f"Request reached Supabase: {e}")

import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve absolute path to backend/.env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    CREWAI_API_URL: str = os.getenv("CREWAI_API_URL", "https://biotwin-ai-v1-df07db0c-7b5d-4de3-8fc6-e6e2d-b42a8fe7.crewai.com")
    CREWAI_BEARER_TOKEN: str = os.getenv("CREWAI_BEARER_TOKEN", "a216738f1c58")
    CREWAI_USER_TOKEN: str = os.getenv("CREWAI_USER_TOKEN", "19c7bd0c0298")
    PORT: int = int(os.getenv("PORT", 8000))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_SENDER: str = os.getenv("SMTP_SENDER", "noreply@biotwin.ai")
    EMAIL_MODE: str = os.getenv("EMAIL_MODE", "development")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY", "")

settings = Settings()


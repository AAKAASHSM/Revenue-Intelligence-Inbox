import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

# Load .env from backend or root directory
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Revenue Intelligence Inbox"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR}/revenue_inbox.db")
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", str(ROOT_DIR / "data")))
    EXPORTS_DIR: Path = Path(os.getenv("EXPORTS_DIR", str(ROOT_DIR / "exports")))

settings = Settings()

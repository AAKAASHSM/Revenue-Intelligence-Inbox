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

is_vercel = os.getenv("VERCEL") == "1" or os.getenv("VERCEL_ENV") is not None

# Fallback path discovery for data directory
default_data_dir = ROOT_DIR / "data"
if not default_data_dir.exists():
    if (Path.cwd() / "data").exists():
        default_data_dir = Path.cwd() / "data"
    elif (BACKEND_DIR / "data").exists():
        default_data_dir = BACKEND_DIR / "data"

default_db_url = "sqlite:////tmp/revenue_inbox.db" if is_vercel else f"sqlite:///{BACKEND_DIR}/revenue_inbox.db"
default_exports_dir = Path("/tmp/exports") if is_vercel else (ROOT_DIR / "exports")

class Settings:
    PROJECT_NAME: str = "Revenue Intelligence Inbox"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db_url)
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", str(default_data_dir)))
    EXPORTS_DIR: Path = Path(os.getenv("EXPORTS_DIR", str(default_exports_dir)))

settings = Settings()

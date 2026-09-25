import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .models import Record
from .services.importer import import_initial_file
from .routers import dashboard, records, imports, brief, export

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)

    # Ensure export directory exists
    settings.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # On cold start, auto-import initial dataset if database is empty
    db = SessionLocal()
    try:
        count = db.query(Record).count()
        if count == 0:
            print("[Startup] Database is empty. Auto-importing initial dataset...")
            await import_initial_file(db)
            print("[Startup] Initial dataset auto-imported successfully.")
    except Exception as e:
        print(f"[Startup Warning] Could not auto-import initial dataset: {e}")
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Revenue Intelligence Inbox for Sales Managers - Evidence-Backed Conversation Intelligence",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(records.router)
app.include_router(imports.router)
app.include_router(brief.router)
app.include_router(export.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "date_context": "2026-08-21 (Asia/Kolkata)"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

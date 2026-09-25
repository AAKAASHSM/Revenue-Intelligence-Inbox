import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings, ROOT_DIR
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

from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

API_PREFIXES = (
    "/dashboard",
    "/records",
    "/import",
    "/manager-brief",
    "/export",
    "/health",
)

@app.middleware("http")
async def ensure_api_prefix(request: Request, call_next):
    # Support reverse proxies or serverless platforms where /api might be stripped
    path = request.scope.get("path", "")
    if path and not path.startswith("/api"):
        for prefix in API_PREFIXES:
            if path == prefix or path.startswith(f"{prefix}/"):
                request.scope["path"] = f"/api{path}"
                break
    return await call_next(request)

# Register routers
app.include_router(dashboard.router)
app.include_router(records.router)
app.include_router(imports.router)
app.include_router(brief.router)
app.include_router(export.router)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Serve frontend build from frontend/dist if available
dist_dir = ROOT_DIR / "frontend" / "dist"
if not dist_dir.exists() and (Path.cwd() / "frontend" / "dist").exists():
    dist_dir = Path.cwd() / "frontend" / "dist"

if dist_dir.exists() and (dist_dir / "index.html").exists():
    if (dist_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = dist_dir / full_path
        if full_path and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(dist_dir / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "status": "online",
            "docs_url": "/docs",
            "date_context": "2026-08-21 (Asia/Kolkata)"
        }

import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import settings
from ..services.export_service import generate_full_export

router = APIRouter(prefix="/api/export", tags=["export"])

@router.post("")
def trigger_export(db: Session = Depends(get_db)):
    result = generate_full_export(db)
    return result

@router.get("/download")
def download_export_zip(db: Session = Depends(get_db)):
    zip_path = settings.EXPORTS_DIR / "revenue_intelligence_export.zip"
    if not zip_path.exists():
        generate_full_export(db)
    return FileResponse(
        path=str(zip_path),
        filename="revenue_intelligence_export.zip",
        media_type="application/zip"
    )

@router.get("/csv")
def download_records_csv(db: Session = Depends(get_db)):
    csv_path = settings.EXPORTS_DIR / "revenue_intelligence_records.csv"
    if not csv_path.exists():
        generate_full_export(db)
    return FileResponse(
        path=str(csv_path),
        filename="revenue_intelligence_records.csv",
        media_type="text/csv"
    )

@router.get("/manifest-csv")
def download_manifest_csv(db: Session = Depends(get_db)):
    manifest_path = settings.EXPORTS_DIR / "manifest.csv"
    if not manifest_path.exists():
        generate_full_export(db)
    return FileResponse(
        path=str(manifest_path),
        filename="manifest.csv",
        media_type="text/csv"
    )

@router.get("/brief-csv")
def download_brief_csv(db: Session = Depends(get_db)):
    brief_csv_path = settings.EXPORTS_DIR / "manager_brief_actions.csv"
    if not brief_csv_path.exists():
        generate_full_export(db)
    return FileResponse(
        path=str(brief_csv_path),
        filename="manager_brief_actions.csv",
        media_type="text/csv"
    )

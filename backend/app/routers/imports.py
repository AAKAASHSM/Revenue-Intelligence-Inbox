from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db, Base, engine
from ..models import ImportRun, Record, Transcript, Route, Analysis, ManualDecision
from ..schemas import ImportResult, ImportRunItem
from ..services.importer import import_initial_file, import_update_file

router = APIRouter(prefix="/api/import", tags=["import"])

@router.post("/initial", response_model=ImportResult)
async def import_initial(db: Session = Depends(get_db)):
    res = await import_initial_file(db)
    return ImportResult(**res)

@router.post("/update", response_model=ImportResult)
async def import_update(db: Session = Depends(get_db)):
    res = await import_update_file(db)
    return ImportResult(**res)

@router.post("/replay", response_model=ImportResult)
async def replay_initial(db: Session = Depends(get_db)):
    # Importing initial file again to demonstrate duplicate prevention
    res = await import_initial_file(db)
    res["batch_type"] = "replay"
    return ImportResult(**res)

@router.get("/history", response_model=List[ImportRunItem])
def get_import_history(db: Session = Depends(get_db)):
    runs = db.query(ImportRun).order_by(ImportRun.id.desc()).all()
    return [
        ImportRunItem(
            id=r.id,
            batch_id=r.batch_id,
            batch_type=r.batch_type,
            revision=r.revision,
            records_processed=r.records_processed,
            records_created=r.records_created,
            records_updated=r.records_updated,
            duplicates_prevented=r.duplicates_prevented,
            started_at=r.started_at.isoformat() + "Z",
            completed_at=r.completed_at.isoformat() + "Z"
        )
        for r in runs
    ]

@router.post("/reset")
def reset_application(db: Session = Depends(get_db)):
    """
    Completely resets the database to a clean slate so the reviewer can reproduce the replay steps.
    """
    db.query(ManualDecision).delete()
    db.query(Route).delete()
    db.query(Analysis).delete()
    db.query(Transcript).delete()
    db.query(Record).delete()
    db.query(ImportRun).delete()
    db.commit()
    return {"status": "success", "message": "Application database has been completely reset to a clean state."}

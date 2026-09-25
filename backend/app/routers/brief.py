from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import ManagerBriefResponse
from ..services.manager_brief_service import generate_manager_brief

router = APIRouter(prefix="/api/manager-brief", tags=["manager-brief"])

@router.get("", response_model=ManagerBriefResponse)
def get_manager_brief_endpoint(db: Session = Depends(get_db)):
    brief = generate_manager_brief(db)
    return ManagerBriefResponse(**brief)

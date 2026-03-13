from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_athlete, require_doctor, require_admin
from app.services.investigation_service import investigation_service
from app.repositories.investigation_repository import investigation_repository
from app.repositories.user_repository import user_repository
from app.schemas.investigation_schema import UpdateInvestigationRequest
from app.constants.drug_risk_levels import InvestigationStatus

router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.get("/my-cases")
def get_my_investigations(
    db: Session = Depends(get_db),
    current_user=Depends(require_athlete),
):
    athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
    investigations = investigation_service.get_by_athlete(db, athlete.id)
    return [
        {
            "id": str(inv.id),
            "case_id": inv.case_id,
            "detected_drug": inv.detected_drug,
            "risk_level": inv.risk_level,
            "status": inv.status,
            "timeline": inv.timeline,
            "created_at": inv.created_at.isoformat(),
        }
        for inv in investigations
    ]


@router.get("/all")
def get_all_investigations(
    skip: int = 0,
    limit: int = 100,
    status: Optional[InvestigationStatus] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    investigations = investigation_service.get_all(db, skip, limit, status)
    return [
        {
            "id": str(inv.id),
            "case_id": inv.case_id,
            "athlete_id": str(inv.athlete_id),
            "detected_drug": inv.detected_drug,
            "risk_level": inv.risk_level,
            "status": inv.status,
            "authority_comments": inv.authority_comments,
            "created_at": inv.created_at.isoformat(),
        }
        for inv in investigations
    ]


@router.put("/{case_id}/status")
def update_investigation_status(
    case_id: str,
    data: UpdateInvestigationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    investigation = investigation_service.update_status(
        db, case_id, data.status, data.comments, current_user.id
    )
    return {
        "message": "Investigation status updated",
        "case_id": investigation.case_id,
        "new_status": investigation.status,
    }


@router.get("/{case_id}")
def get_investigation_detail(
    case_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    investigation = investigation_repository.get_by_case_id(db, case_id)
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return {
        "id": str(investigation.id),
        "case_id": investigation.case_id,
        "athlete_id": str(investigation.athlete_id),
        "detected_drug": investigation.detected_drug,
        "risk_level": investigation.risk_level,
        "status": investigation.status,
        "authority_comments": investigation.authority_comments,
        "timeline": investigation.timeline,
        "created_at": investigation.created_at.isoformat(),
    }

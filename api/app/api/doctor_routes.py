from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.middleware.role_middleware import require_doctor
from app.repositories.report_repository import report_repository

router = APIRouter(prefix="/doctor", tags=["Doctor"])


@router.get("/pending-reviews")
def get_pending_reviews(
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    reports = report_repository.get_pending_doctor_review(db)
    return [
        {
            "id": str(r.id),
            "report_id": r.report_id,
            "athlete_id": str(r.athlete_id),
            "detected_drugs": r.detected_drugs,
            "risk_level": r.risk_level,
            "ai_confidence_score": r.ai_confidence_score,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.get("/dashboard")
def doctor_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    from sqlalchemy import func
    from app.models.report_model import MedicalReport
    pending_count = len(report_repository.get_pending_doctor_review(db))
    total_verified = (
        db.query(func.count(MedicalReport.id))
        .filter(MedicalReport.verified_by == current_user.id)
        .scalar()
    )
    return {
        "doctor_name": current_user.name,
        "pending_reviews": pending_count,
        "total_verified_by_me": total_verified,
    }

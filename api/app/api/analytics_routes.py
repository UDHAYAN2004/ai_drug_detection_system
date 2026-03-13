from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.middleware.role_middleware import require_doctor
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# require_doctor already allows both DOCTOR and ADMIN roles (see role_middleware.py)


@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),   # was require_admin — now doctors can access too
):
    return analytics_service.get_dashboard_stats(db)


@router.get("/monthly-reports")
def get_monthly_reports(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    return analytics_service.get_monthly_report_stats(db, months)


@router.get("/detection-trends")
def get_detection_trends(
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    return analytics_service.get_drug_detection_trends(db)
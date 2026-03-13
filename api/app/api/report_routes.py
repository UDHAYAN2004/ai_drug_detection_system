from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_athlete, require_doctor
from app.services.report_service import report_service
from app.repositories.report_repository import report_repository
from app.repositories.user_repository import user_repository
from app.schemas.report_schema import DoctorVerificationRequest

router = APIRouter(prefix="/reports", tags=["Reports"])


# ─── Static routes MUST be declared before /{report_uuid} ────────────────────

@router.get("/admin/all")
def get_all_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    reports = report_repository.get_all(db, skip=skip, limit=limit)
    return [
        {
            "id":               str(r.id),
            "report_id":        r.report_id,
            "athlete_id":       str(r.athlete_id),
            "detection_status": r.detection_status,
            "risk_level":       r.risk_level,
            "doctor_verified":  r.doctor_verified,
            "created_at":       r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.post("/upload", status_code=201)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_athlete),
):
    athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
    return await report_service.upload_and_analyze(db, file, athlete.id)


@router.get("/my-reports")
def get_my_reports(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(require_athlete),
):
    athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
    reports = report_repository.get_by_athlete(db, athlete.id, skip=skip, limit=limit)
    return [
        {
            "id":                  str(r.id),
            "report_id":           r.report_id,
            "file_name":           r.file_name,
            "detection_status":    r.detection_status,
            "risk_level":          r.risk_level,
            "ai_confidence_score": r.ai_confidence_score,
            "doctor_verified":     r.doctor_verified,
            "created_at":          r.created_at.isoformat(),
        }
        for r in reports
    ]


# ─── Dynamic routes — MUST come after all static routes ──────────────────────

@router.get("/{report_uuid}")
def get_report_detail(
    report_uuid: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    report = report_repository.get_by_id(db, report_uuid)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.role.value == "athlete":
        athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
        if report.athlete_id != athlete.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return {
        "id":                  str(report.id),
        "report_id":           report.report_id,
        "file_name":           report.file_name,
        "file_type":           report.file_type,
        "extracted_text":      report.extracted_text,
        "ocr_confidence":      report.ocr_confidence,
        "detection_status":    report.detection_status,
        "detected_drugs":      report.detected_drugs,
        "risk_level":          report.risk_level,
        "ai_confidence_score": report.ai_confidence_score,
        "ai_analysis_details": report.ai_analysis_details,
        "doctor_verified":     report.doctor_verified,
        "doctor_comments":     report.doctor_comments,
        "created_at":          report.created_at.isoformat(),
    }


@router.post("/{report_uuid}/verify")
def doctor_verify_report(
    report_uuid: uuid.UUID,
    data: DoctorVerificationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),
):
    return report_service.verify_by_doctor(db, report_uuid, current_user.id, data.action, data.comments)
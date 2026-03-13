from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.repositories.report_repository import report_repository
from app.repositories.investigation_repository import investigation_repository
from app.repositories.user_repository import user_repository

from app.models.ban_model import Ban
from app.models.report_model import MedicalReport

from app.constants.drug_risk_levels import (
    BanStatus,
    DrugDetectionStatus,
    RiskLevel
)


class AnalyticsService:

    def get_dashboard_stats(self, db: Session) -> Dict[str, Any]:

        user_counts = user_repository.count_by_role(db)
        report_counts = report_repository.count_by_status(db)

        active_investigations = investigation_repository.count_active(db)

        active_bans = db.query(func.count(Ban.id)).filter(
            Ban.status == BanStatus.ACTIVE
        ).scalar()

        pending_reports = db.query(func.count(MedicalReport.id)).filter(
            MedicalReport.detection_status == DrugDetectionStatus.PENDING
        ).scalar()

        return {
            "total_athletes": user_counts.get("athlete", 0),
            "total_doctors": user_counts.get("doctor", 0),
            "total_admins": user_counts.get("admin", 0),
            "total_reports": sum(report_counts.values()),
            "reports_by_status": report_counts,
            "active_investigations": active_investigations,
            "active_bans": active_bans,
            "pending_reports": pending_reports,
        }

    def get_monthly_report_stats(self, db: Session, months: int = 6) -> List[Dict[str, Any]]:
        return report_repository.monthly_stats(db, months)

    def get_drug_detection_trends(self, db: Session) -> Dict[str, Any]:

        total = db.query(func.count(MedicalReport.id)).scalar()

        detected = db.query(func.count(MedicalReport.id)).filter(
            MedicalReport.detection_status == DrugDetectionStatus.DETECTED
        ).scalar()

        clean = db.query(func.count(MedicalReport.id)).filter(
            MedicalReport.detection_status == DrugDetectionStatus.CLEAN
        ).scalar()

        by_risk = {}

        for risk in RiskLevel:
            count = db.query(func.count(MedicalReport.id)).filter(
                MedicalReport.risk_level == risk
            ).scalar()

            by_risk[risk.value] = count

        detection_rate = round((detected / total * 100), 2) if total > 0 else 0

        return {
            "total_reports": total,
            "detected": detected,
            "clean": clean,
            "detection_rate_percent": detection_rate,
            "by_risk_level": by_risk,
        }


analytics_service = AnalyticsService()
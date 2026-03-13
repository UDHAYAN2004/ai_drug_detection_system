from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, case
import uuid
from app.models.report_model import MedicalReport
from app.constants.drug_risk_levels import DrugDetectionStatus


class ReportRepository:

    def get_by_id(self, db: Session, report_id: uuid.UUID) -> Optional[MedicalReport]:
        return db.query(MedicalReport).filter(MedicalReport.id == report_id).first()

    def get_by_report_id(self, db: Session, report_id: str) -> Optional[MedicalReport]:
        return db.query(MedicalReport).filter(MedicalReport.report_id == report_id).first()

    def get_by_athlete(self, db: Session, athlete_id: uuid.UUID, skip: int = 0, limit: int = 50) -> List[MedicalReport]:
        return (
            db.query(MedicalReport)
            .filter(MedicalReport.athlete_id == athlete_id)
            .order_by(desc(MedicalReport.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all(self, db: Session, skip: int = 0, limit: int = 100,
                status: Optional[DrugDetectionStatus] = None) -> List[MedicalReport]:
        query = db.query(MedicalReport).order_by(desc(MedicalReport.created_at))
        if status:
            query = query.filter(MedicalReport.detection_status == status)
        return query.offset(skip).limit(limit).all()

    def get_pending_doctor_review(self, db: Session) -> List[MedicalReport]:
        return (
            db.query(MedicalReport)
            .filter(
                MedicalReport.detection_status == DrugDetectionStatus.DETECTED,
                MedicalReport.doctor_verified == None,
            )
            .order_by(desc(MedicalReport.created_at))
            .all()
        )

    def create(self, db: Session, **kwargs) -> MedicalReport:
        report = MedicalReport(**kwargs)
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def update(self, db: Session, report: MedicalReport, **kwargs) -> MedicalReport:
        for key, value in kwargs.items():
            if hasattr(report, key):
                setattr(report, key, value)
        db.commit()
        db.refresh(report)
        return report

    def count_by_status(self, db: Session) -> dict:
        results = (
            db.query(MedicalReport.detection_status, func.count(MedicalReport.id))
            .group_by(MedicalReport.detection_status)
            .all()
        )
        return {str(r[0]): r[1] for r in results}

    def monthly_stats(self, db: Session, months: int = 6) -> List[dict]:
        from sqlalchemy import extract
        from datetime import datetime, timedelta, timezone

        cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)

        #SQLAlchemy 2.x syntax: case(condition, value) imported from sqlalchemy directly
        detected_case = case(
            (MedicalReport.detection_status == DrugDetectionStatus.DETECTED, 1),
            else_=0,
        )

        results = (
            db.query(
                extract("year",  MedicalReport.created_at).label("year"),
                extract("month", MedicalReport.created_at).label("month"),
                func.count(MedicalReport.id).label("total"),
                func.sum(detected_case).label("detected"),
            )
            .filter(MedicalReport.created_at >= cutoff)
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        return [
            {
                "year":     int(r.year),
                "month":    int(r.month),
                "total":    r.total or 0,
                "detected": int(r.detected or 0),
            }
            for r in results
        ]


report_repository = ReportRepository()
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import uuid
from app.models.investigation_model import Investigation
from app.constants.drug_risk_levels import InvestigationStatus


class InvestigationRepository:

    def get_by_id(self, db: Session, inv_id: uuid.UUID) -> Optional[Investigation]:
        return db.query(Investigation).filter(Investigation.id == inv_id).first()

    def get_by_case_id(self, db: Session, case_id: str) -> Optional[Investigation]:
        return db.query(Investigation).filter(Investigation.case_id == case_id).first()

    def get_by_athlete(self, db: Session, athlete_id: uuid.UUID) -> List[Investigation]:
        return (
            db.query(Investigation)
            .filter(Investigation.athlete_id == athlete_id)
            .order_by(desc(Investigation.created_at))
            .all()
        )

    def get_all(self, db: Session, skip: int = 0, limit: int = 100,
                status: Optional[InvestigationStatus] = None) -> List[Investigation]:
        query = db.query(Investigation).order_by(desc(Investigation.created_at))
        if status:
            query = query.filter(Investigation.status == status)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, **kwargs) -> Investigation:
        investigation = Investigation(**kwargs)
        db.add(investigation)
        db.commit()
        db.refresh(investigation)
        return investigation

    def update(self, db: Session, investigation: Investigation, **kwargs) -> Investigation:
        for key, value in kwargs.items():
            if hasattr(investigation, key):
                setattr(investigation, key, value)
        db.commit()
        db.refresh(investigation)
        return investigation

    def count_active(self, db: Session) -> int:
        return (
            db.query(func.count(Investigation.id))
            .filter(Investigation.status.in_([InvestigationStatus.PENDING, InvestigationStatus.UNDER_REVIEW]))
            .scalar()
        )


investigation_repository = InvestigationRepository()

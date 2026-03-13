from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
import uuid
from datetime import datetime, timezone

from app.repositories.investigation_repository import investigation_repository
from app.models.investigation_model import Investigation
from app.constants.drug_risk_levels import InvestigationStatus, RiskLevel
from app.utils.helpers import generate_case_id
from app.utils.logger import logger


class InvestigationService:

    def create_investigation(
        self,
        db: Session,
        athlete_id: uuid.UUID,
        report_id: uuid.UUID,
        detected_drug: str,
        risk_level: RiskLevel,
    ) -> Investigation:
        initial_timeline = [
            {
                "status": InvestigationStatus.PENDING,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "note": "Investigation automatically created by AI detection",
            }
        ]
        return investigation_repository.create(
            db,
            case_id=generate_case_id(),
            athlete_id=athlete_id,
            report_id=report_id,
            detected_drug=detected_drug,
            risk_level=risk_level,
            status=InvestigationStatus.PENDING,
            timeline=initial_timeline,
        )

    def update_status(
        self,
        db: Session,
        case_id: str,
        new_status: InvestigationStatus,
        comments: Optional[str] = None,
        updated_by: Optional[uuid.UUID] = None,
    ) -> Investigation:
        investigation = investigation_repository.get_by_case_id(db, case_id)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")

        # Append to timeline
        timeline = investigation.timeline or []
        timeline.append({
            "status": new_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": comments or f"Status updated to {new_status}",
            "updated_by": str(updated_by) if updated_by else None,
        })

        investigation = investigation_repository.update(
            db,
            investigation,
            status=new_status,
            authority_comments=comments,
            timeline=timeline,
        )

        logger.info(f"Investigation {case_id} status → {new_status}")
        return investigation

    def get_by_athlete(self, db: Session, athlete_id: uuid.UUID) -> List[Investigation]:
        return investigation_repository.get_by_athlete(db, athlete_id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100,
                status: Optional[InvestigationStatus] = None) -> List[Investigation]:
        return investigation_repository.get_all(db, skip, limit, status)


investigation_service = InvestigationService()

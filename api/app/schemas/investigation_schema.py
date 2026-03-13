from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
import uuid
from app.constants.drug_risk_levels import InvestigationStatus, RiskLevel


class InvestigationResponse(BaseModel):
    id: uuid.UUID
    case_id: str
    athlete_id: uuid.UUID
    detected_drug: str
    risk_level: RiskLevel
    status: InvestigationStatus
    authority_comments: Optional[str] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateInvestigationRequest(BaseModel):
    status: InvestigationStatus
    comments: Optional[str] = None

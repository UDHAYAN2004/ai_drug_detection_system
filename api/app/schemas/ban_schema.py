from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
import uuid
from app.constants.drug_risk_levels import BanStatus


class BanCreate(BaseModel):
    athlete_id: uuid.UUID
    investigation_id: uuid.UUID
    detected_drug: str
    ban_start_date: date
    ban_end_date: Optional[date] = None
    ban_type: str  # warning/suspension/competition_ban/permanent
    authority_comments: Optional[str] = None


class BanResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    detected_drug: str
    ban_start_date: date
    ban_end_date: Optional[date] = None
    ban_duration_days: Optional[str] = None
    ban_type: str
    status: BanStatus
    authority_comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

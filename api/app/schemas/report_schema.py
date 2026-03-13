from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
import uuid
from app.constants.drug_risk_levels import DrugDetectionStatus, RiskLevel


class ReportResponse(BaseModel):
    id: uuid.UUID
    report_id: str
    athlete_id: uuid.UUID
    file_name: str
    file_type: str
    detection_status: DrugDetectionStatus
    detected_drugs: Optional[List[str]] = None
    risk_level: Optional[RiskLevel] = None
    ai_confidence_score: Optional[float] = None
    extracted_text: Optional[str] = None
    doctor_verified: Optional[str] = None
    doctor_comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    id: uuid.UUID
    report_id: str
    file_name: str
    detection_status: DrugDetectionStatus
    risk_level: Optional[RiskLevel] = None
    doctor_verified: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DoctorVerificationRequest(BaseModel):
    action: str  # approved / rejected
    comments: Optional[str] = None


class AIAnalysisResult(BaseModel):
    report_id: str
    extracted_text: str
    ocr_confidence: float
    detection_status: DrugDetectionStatus
    detected_drugs: List[Dict[str, Any]]
    risk_level: Optional[RiskLevel]
    ai_confidence_score: float
    analysis_details: Dict[str, Any]

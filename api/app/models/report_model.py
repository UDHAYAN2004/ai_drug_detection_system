import uuid
from sqlalchemy import Column, String, Text, Float, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.constants.drug_risk_levels import DrugDetectionStatus, RiskLevel


class MedicalReport(Base, TimestampMixin):
    __tablename__ = "medical_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(String(20), unique=True, nullable=False, index=True)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Float, nullable=True)

    # OCR Results
    extracted_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)

    # AI Detection Results
    detection_status = Column(SAEnum(DrugDetectionStatus), default=DrugDetectionStatus.PENDING)
    detected_drugs = Column(JSON, nullable=True)  # List of detected drug names
    risk_level = Column(SAEnum(RiskLevel), nullable=True)
    ai_confidence_score = Column(Float, nullable=True)
    ai_analysis_details = Column(JSON, nullable=True)

    # Doctor Verification
    doctor_verified = Column(String(20), nullable=True)  # approved/rejected/pending
    doctor_comments = Column(Text, nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    athlete = relationship("Athlete", back_populates="reports")
    investigation = relationship("Investigation", back_populates="report", uselist=False)

    def __repr__(self):
        return f"<MedicalReport {self.report_id}>"

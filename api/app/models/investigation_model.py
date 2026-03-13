import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.constants.drug_risk_levels import InvestigationStatus, RiskLevel


class Investigation(Base, TimestampMixin):
    __tablename__ = "investigations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String(20), unique=True, nullable=False, index=True)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)
    report_id = Column(UUID(as_uuid=True), ForeignKey("medical_reports.id"), nullable=False)
    detected_drug = Column(String(255), nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    status = Column(SAEnum(InvestigationStatus), default=InvestigationStatus.PENDING)
    authority_comments = Column(Text, nullable=True)
    assigned_doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    timeline = Column(JSON, nullable=True)  # List of status changes with timestamps

    athlete = relationship("Athlete", back_populates="investigations")
    report = relationship("MedicalReport", back_populates="investigation")
    ban = relationship("Ban", back_populates="investigation", uselist=False)

    def __repr__(self):
        return f"<Investigation {self.case_id}>"

import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.constants.drug_risk_levels import BanStatus


class Ban(Base, TimestampMixin):
    __tablename__ = "bans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)
    investigation_id = Column(UUID(as_uuid=True), ForeignKey("investigations.id"), nullable=False)
    detected_drug = Column(String(255), nullable=False)
    ban_start_date = Column(Date, nullable=False)
    ban_end_date = Column(Date, nullable=True)
    ban_duration_days = Column(String(50), nullable=True)
    ban_type = Column(String(50), nullable=False)  # warning/suspension/competition_ban/permanent
    status = Column(SAEnum(BanStatus), default=BanStatus.ACTIVE)
    authority_comments = Column(Text, nullable=True)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    athlete = relationship("Athlete", back_populates="bans")
    investigation = relationship("Investigation", back_populates="ban")

    def __repr__(self):
        return f"<Ban {self.id} - {self.detected_drug}>"

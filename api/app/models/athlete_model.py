import uuid
from sqlalchemy import Column, String, Date, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin


class Athlete(Base, TimestampMixin):
    __tablename__ = "athletes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    sport = Column(String(100), nullable=True)
    nationality = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    athlete_id_number = Column(String(50), unique=True, nullable=True)
    team = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)

    user = relationship("User", back_populates="athlete")
    reports = relationship("MedicalReport", back_populates="athlete")
    investigations = relationship("Investigation", back_populates="athlete")
    bans = relationship("Ban", back_populates="athlete")

    def __repr__(self):
        return f"<Athlete {self.athlete_id_number}>"

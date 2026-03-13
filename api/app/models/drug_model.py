import uuid
from sqlalchemy import Column, String, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database.base import Base, TimestampMixin


class Drug(Base, TimestampMixin):
    __tablename__ = "drugs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    aliases = Column(JSON, nullable=True)  # Alternative names/synonyms
    category = Column(String(100), nullable=False)
    is_banned = Column(Boolean, default=True)
    wada_prohibited = Column(Boolean, default=False)
    health_risks = Column(JSON, nullable=True)  # List of health risks
    description = Column(Text, nullable=True)
    detection_keywords = Column(JSON, nullable=True)  # Keywords for NLP detection

    def __repr__(self):
        return f"<Drug {self.name}>"

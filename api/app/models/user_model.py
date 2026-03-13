import uuid
from sqlalchemy import Column, String, Boolean, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin
from app.constants.roles import UserRole, UserStatus


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ATHLETE)
    status = Column(SAEnum(UserStatus), nullable=False, default=UserStatus.ACTIVE)
    id_proof_path = Column(String(500), nullable=True)
    is_email_verified = Column(Boolean, default=False)
    refresh_token = Column(Text, nullable=True)

    athlete = relationship("Athlete", back_populates="user", uselist=False)
    activity_logs = relationship("ActivityLog", back_populates="user")

    def __repr__(self):
        return f"<User {self.email} [{self.role}]>"

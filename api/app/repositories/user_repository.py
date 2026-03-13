from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid
from app.models.user_model import User
from app.models.athlete_model import Athlete
from app.constants.roles import UserRole, UserStatus


class UserRepository:

    def get_by_id(self, db: Session, user_id: uuid.UUID) -> Optional[User]:
        return db.query(User).filter(User.id == user_id, User.status != UserStatus.SUSPENDED).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, role: Optional[UserRole] = None) -> List[User]:
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, **kwargs) -> User:
        kwargs["email"] = kwargs["email"].lower()
        user = User(**kwargs)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update(self, db: Session, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    def delete(self, db: Session, user_id: uuid.UUID) -> bool:
        user = self.get_by_id(db, user_id)
        if user:
            db.delete(user)
            db.commit()
            return True
        return False

    def get_or_create_athlete_profile(self, db: Session, user_id: uuid.UUID) -> Athlete:
        athlete = db.query(Athlete).filter(Athlete.user_id == user_id).first()
        if not athlete:
            athlete = Athlete(user_id=user_id)
            db.add(athlete)
            db.commit()
            db.refresh(athlete)
        return athlete

    def count_by_role(self, db: Session) -> dict:
        from sqlalchemy import func
        results = db.query(User.role, func.count(User.id)).group_by(User.role).all()
        return {r[0]: r[1] for r in results}


user_repository = UserRepository()

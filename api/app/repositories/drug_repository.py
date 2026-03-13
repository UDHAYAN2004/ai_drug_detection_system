from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.drug_model import Drug


class DrugRepository:

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Drug]:
        return db.query(Drug).offset(skip).limit(limit).all()

    def get_by_name(self, db: Session, name: str) -> Optional[Drug]:
        return db.query(Drug).filter(func.lower(Drug.name) == name.lower()).first()

    def get_banned(self, db: Session) -> List[Drug]:
        return db.query(Drug).filter(Drug.is_banned == True).all()

    def search(self, db: Session, query: str) -> List[Drug]:
        return (
            db.query(Drug)
            .filter(func.lower(Drug.name).contains(query.lower()))
            .all()
        )

    def create(self, db: Session, **kwargs) -> Drug:
        drug = Drug(**kwargs)
        db.add(drug)
        db.commit()
        db.refresh(drug)
        return drug

    def count(self, db: Session) -> int:
        return db.query(func.count(Drug.id)).scalar()


drug_repository = DrugRepository()

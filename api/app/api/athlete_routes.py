from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.middleware.role_middleware import require_athlete, require_admin
from app.repositories.user_repository import user_repository
from app.schemas.user_schema import AthleteProfileUpdate, UserResponse

router = APIRouter(prefix="/athletes", tags=["Athletes"])


@router.get("/profile")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(require_athlete),
):
    athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
    return {
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "status": current_user.status,
        },
        "athlete": {
            "id": str(athlete.id),
            "sport": athlete.sport,
            "nationality": athlete.nationality,
            "date_of_birth": str(athlete.date_of_birth) if athlete.date_of_birth else None,
            "athlete_id_number": athlete.athlete_id_number,
            "team": athlete.team,
            "bio": athlete.bio,
        },
    }


@router.put("/profile")
def update_profile(
    data: AthleteProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_athlete),
):
    athlete = user_repository.get_or_create_athlete_profile(db, current_user.id)
    for key, value in data.model_dump(exclude_none=True).items():
        if hasattr(athlete, key) and value is not None:
            setattr(athlete, key, value)
    db.commit()
    db.refresh(athlete)
    return {"message": "Profile updated successfully"}


@router.get("/all")
def get_all_athletes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    from app.constants.roles import UserRole
    users = user_repository.get_all(db, skip=skip, limit=limit, role=UserRole.ATHLETE)
    return [
        {"id": str(u.id), "name": u.name, "email": u.email, "status": u.status}
        for u in users
    ]

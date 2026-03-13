from functools import wraps
from typing import List
from fastapi import HTTPException, status, Depends
from app.middleware.auth_middleware import get_current_user
from app.models.user_model import User
from app.constants.roles import UserRole


def require_roles(*roles: UserRole):
    """Role-based access control dependency."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.ADMIN, UserRole.DOCTOR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor or Admin access required")
    return current_user


def require_athlete(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ATHLETE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Athlete access required")
    return current_user

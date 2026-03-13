from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.database.session import get_db
from app.middleware.role_middleware import require_admin, require_doctor
from app.repositories.user_repository import user_repository
from app.schemas.user_schema import UserUpdate
from app.constants.roles import UserRole, UserStatus

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),   # doctors + admins
):
    from app.services.analytics_service import analytics_service
    return analytics_service.get_dashboard_stats(db)


@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),   # doctors + admins can view users
):
    users = user_repository.get_all(db, skip=skip, limit=limit, role=role)
    return [
        {
            "id":         str(u.id),
            "name":       u.name,
            "email":      u.email,
            "role":       u.role,
            "status":     u.status,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/users/{user_id}")
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),    # admin only — sensitive action
):
    user = user_repository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = user_repository.update(db, user, **data.model_dump(exclude_none=True))
    return {"message": "User updated", "user_id": str(updated.id)}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),    # admin only — sensitive action
):
    deleted = user_repository.delete(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@router.get("/activity-logs")
def get_activity_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_doctor),   # doctors + admins
):
    from app.models.activity_log_model import ActivityLog
    from sqlalchemy import desc
    logs = (
        db.query(ActivityLog)
        .order_by(desc(ActivityLog.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id":            str(log.id),
            "user_id":       str(log.user_id) if log.user_id else None,
            "action":        log.action,
            "resource_type": log.resource_type,
            "details":       log.details,
            "ip_address":    log.ip_address,
            "created_at":    log.created_at.isoformat(),
        }
        for log in logs
    ]
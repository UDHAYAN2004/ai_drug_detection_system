from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import user_repository
from app.utils.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, verify_token_type
)
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse
from app.constants.roles import UserStatus
from app.utils.logger import logger
import uuid


class AuthService:

    def register(self, db: Session, data: RegisterRequest, id_proof_path: Optional[str] = None) -> Dict[str, Any]:
        existing = user_repository.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        hashed_pw = hash_password(data.password)
        user = user_repository.create(
            db,
            name=data.name,
            email=data.email,
            phone=data.phone,
            hashed_password=hashed_pw,
            role=data.role,
            id_proof_path=id_proof_path,
        )

        # Auto-create athlete profile if role is athlete
        if data.role.value == "athlete":
            user_repository.get_or_create_athlete_profile(db, user.id)

        logger.info(f"New user registered: {user.email} [{user.role}]")
        return {"message": "Registration successful", "user_id": str(user.id), "role": user.role}

    def login(self, db: Session, data: LoginRequest) -> TokenResponse:
        user = user_repository.get_by_email(db, data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if user.status == UserStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is suspended. Please contact administrator.",
            )

        if user.status == UserStatus.BANNED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is banned.",
            )

        if user.role != data.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You are not registered as {data.role}",
            )

        token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_repository.update(db, user, refresh_token=refresh_token)

        logger.info(f"User logged in: {user.email}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            role=user.role,
            user_id=str(user.id),
            name=user.name,
        )

    def refresh_tokens(self, db: Session, refresh_token: str) -> TokenResponse:
        payload = verify_token_type(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        user_id = payload.get("sub")
        user = user_repository.get_by_id(db, uuid.UUID(user_id))
        if not user or user.refresh_token != refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token mismatch",
            )

        token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)
        user_repository.update(db, user, refresh_token=new_refresh)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            role=user.role,
            user_id=str(user.id),
            name=user.name,
        )

    def logout(self, db: Session, user_id: uuid.UUID):
        user = user_repository.get_by_id(db, user_id)
        if user:
            user_repository.update(db, user, refresh_token=None)
        logger.info(f"User logged out: {user_id}")


auth_service = AuthService()

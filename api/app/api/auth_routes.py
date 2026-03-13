from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, Request, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import ValidationError
from app.database.session import get_db
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import get_current_user
from app.constants.roles import UserRole
from app.utils.file_upload import save_upload_file

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
async def register(
    name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    password: str = Form(...),
    role: UserRole = Form(...),
    id_proof: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    try:
        data = RegisterRequest(name=name, email=email, phone=phone, password=password, role=role)
    except (ValidationError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    id_proof_path = None
    if id_proof:
        file_info = await save_upload_file(id_proof, subfolder="id_proofs")
        id_proof_path = file_info["file_path"]

    return auth_service.register(db, data, id_proof_path)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, data)


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_tokens(db, data.refresh_token)


@router.post("/logout")
def logout(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    auth_service.logout(db, current_user.id)
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "status": current_user.status,
    }

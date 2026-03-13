import os
import uuid
import shutil
from pathlib import Path
from typing import Dict
from fastapi import UploadFile, HTTPException, status
from app.config.settings import settings
from app.utils.logger import logger


async def save_upload_file(file: UploadFile, subfolder: str = "") -> Dict[str, str]:
    """Save uploaded file and return file info."""
    # Validate file extension
    ext = Path(file.filename).suffix.lower().lstrip(".")
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Validate file size
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )
    await file.seek(0)

    # Create unique filename
    unique_name = f"{uuid.uuid4()}.{ext}"
    upload_dir = Path(settings.UPLOAD_DIR)
    if subfolder:
        upload_dir = upload_dir / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / unique_name

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    logger.info(f"File saved: {file_path}")
    return {
        "file_path": str(file_path),
        "file_name": file.filename,
        "file_type": ext,
        "file_size": len(content) / 1024,  # KB
    }


def delete_file(file_path: str) -> bool:
    """Delete a file safely."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        logger.error(f"Error deleting file {file_path}: {e}")
    return False

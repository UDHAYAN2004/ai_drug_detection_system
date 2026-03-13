import os
from pathlib import Path


def create_required_directories():
    """Create required directories on startup."""
    dirs = [
        "uploads/reports",
        "logs",
        "migrations",
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)


def is_production() -> bool:
    return os.getenv("APP_ENV", "development") == "production"


def is_development() -> bool:
    return os.getenv("APP_ENV", "development") == "development"

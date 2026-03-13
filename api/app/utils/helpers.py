import random
import string
from datetime import datetime, timezone


def generate_report_id() -> str:
    """Generate unique report ID: RPT-YYYYMMDD-XXXXX"""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"RPT-{date_str}-{random_part}"


def generate_case_id() -> str:
    """Generate unique case ID: CASE-YYYYMMDD-XXXXX"""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"CASE-{date_str}-{random_part}"


def calculate_ban_duration(start_date, end_date) -> str:
    if not end_date:
        return "Permanent"
    delta = end_date - start_date
    years = delta.days // 365
    months = (delta.days % 365) // 30
    days = delta.days % 30
    parts = []
    if years:
        parts.append(f"{years} year{'s' if years > 1 else ''}")
    if months:
        parts.append(f"{months} month{'s' if months > 1 else ''}")
    if days:
        parts.append(f"{days} day{'s' if days > 1 else ''}")
    return ", ".join(parts) if parts else "0 days"


def sanitize_text(text: str) -> str:
    """Basic text sanitization."""
    if not text:
        return ""
    return text.strip()

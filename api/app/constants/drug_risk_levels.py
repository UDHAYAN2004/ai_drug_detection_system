from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class InvestigationStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    CONFIRMED = "confirmed"
    CLEARED = "cleared"
    CLOSED = "closed"


class BanStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    APPEALED = "appealed"
    REVOKED = "revoked"


class DrugDetectionStatus(str, Enum):
    CLEAN = "clean"
    DETECTED = "detected"
    INCONCLUSIVE = "inconclusive"
    PENDING = "pending"


RISK_LEVEL_COLORS = {
    RiskLevel.LOW: "#22c55e",
    RiskLevel.MEDIUM: "#f59e0b",
    RiskLevel.HIGH: "#ef4444",
    RiskLevel.CRITICAL: "#7c3aed",
}

BANNED_SUBSTANCES_CATEGORIES = [
    "Anabolic Steroids",
    "Peptide Hormones",
    "Beta-2 Agonists",
    "Hormone Modulators",
    "Diuretics",
    "Stimulants",
    "Narcotics",
    "Cannabinoids",
    "Glucocorticoids",
    "Beta-Blockers",
]

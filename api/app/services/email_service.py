from typing import Optional, List
from app.utils.logger import logger


class EmailService:
    """Email notification service (stub - configure SMTP for production)."""

    async def send_analysis_result(
        self,
        to_email: str,
        athlete_name: str,
        report_id: str,
        detection_status: str,
        detected_drugs: List[str],
        risk_level: str,
    ):
        """Send drug analysis result email to athlete."""
        subject = f"Medical Report Analysis Result - {report_id}"
        status_text = "DRUG DETECTED ⚠️" if detection_status == "detected" else "CLEAN ✅"

        body = f"""
Dear {athlete_name},

Your medical report (ID: {report_id}) has been analyzed.

STATUS: {status_text}
Risk Level: {risk_level.upper()}
{"Detected Substances: " + ", ".join(detected_drugs) if detected_drugs else "No banned substances detected."}

Analysis completed at: {__import__("datetime").datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}

If you have any questions, please contact your team doctor.

AI Drug Detection System
        """
        # TODO: Integrate with fastapi-mail for actual sending
        logger.info(f"[EMAIL] To: {to_email} | Subject: {subject}")
        logger.debug(f"[EMAIL BODY]\n{body}")

    async def send_investigation_update(
        self,
        to_email: str,
        athlete_name: str,
        case_id: str,
        new_status: str,
        comments: Optional[str] = None,
    ):
        subject = f"Investigation Update - {case_id}"
        logger.info(f"[EMAIL] Investigation update to {to_email}: {case_id} → {new_status}")

    async def send_ban_notification(
        self,
        to_email: str,
        athlete_name: str,
        ban_type: str,
        detected_drug: str,
        start_date: str,
        end_date: Optional[str],
    ):
        subject = "Important: Anti-Doping Violation Notice"
        logger.info(f"[EMAIL] Ban notification to {to_email}: {ban_type}")


email_service = EmailService()

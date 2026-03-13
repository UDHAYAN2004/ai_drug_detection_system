from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import uuid

from app.repositories.report_repository import report_repository
from app.ai_engine.ocr_engine import ocr_engine
from app.ai_engine.drug_detector import drug_detector
from app.utils.file_upload import save_upload_file
from app.utils.helpers import generate_report_id
from app.constants.drug_risk_levels import DrugDetectionStatus
from app.utils.logger import logger


class ReportService:

    async def upload_and_analyze(
        self,
        db: Session,
        file: UploadFile,
        athlete_id: uuid.UUID,
    ) -> Dict[str, Any]:

        # ───── Save File ─────

        try:
            file_info = await save_upload_file(file, subfolder=str(athlete_id))
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise HTTPException(status_code=500, detail="File upload failed")

        # ───── Create Report ─────

        report = report_repository.create(
            db,
            report_id=generate_report_id(),
            athlete_id=athlete_id,
            file_path=file_info["file_path"],
            file_name=file_info["file_name"],
            file_type=file_info["file_type"],
            file_size=file_info["file_size"],
            detection_status=DrugDetectionStatus.PENDING,
        )

        # ───── OCR PROCESSING ─────

        extracted_text = ""
        ocr_confidence = 0

        try:
            ocr_result = ocr_engine.process_file(file_info["file_path"])

            extracted_text = ocr_result.get("text", "")
            ocr_confidence = ocr_result.get("confidence", 0)

        except Exception as e:
            logger.warning(f"OCR failed: {e}")

        # ───── AI DRUG DETECTION ─────

        try:

            detection = drug_detector.detect(extracted_text)

        except Exception as e:

            logger.error(f"AI detection failed: {e}")

            detection = {
                "status": DrugDetectionStatus.INCONCLUSIVE,
                "detected_drugs": [],
                "risk_level": None,
                "confidence_score": 0,
            }

        detected_drugs = [d["drug_name"] for d in detection.get("detected_drugs", [])]

        # ───── Update Report ─────

        report_repository.update(
            db,
            report,
            extracted_text=extracted_text,
            ocr_confidence=ocr_confidence,
            detection_status=detection["status"],
            detected_drugs=detected_drugs,
            risk_level=detection.get("risk_level"),
            ai_confidence_score=detection.get("confidence_score"),
        )

        # ───── Response ─────

        return {
            "report_id": report.report_id,
            "detection_status": detection["status"],
            "detected_drugs": detected_drugs,
            "risk_level": detection.get("risk_level"),
            "ai_confidence_score": detection.get("confidence_score"),
            "ocr_confidence": ocr_confidence,
            "message": "Analysis complete",
        }

    def verify_by_doctor(
        self,
        db: Session,
        report_uuid: uuid.UUID,
        doctor_id: uuid.UUID,
        action: str,
        comments: Optional[str] = None,
    ):

        report = report_repository.get_by_id(db, report_uuid)

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        action_map = {
            "approve": "approved",
            "approved": "approved",
            "reject": "rejected",
            "rejected": "rejected",
        }

        normalized = action_map.get(action.lower())

        if not normalized:
            raise HTTPException(status_code=400, detail="Invalid action")

        report_repository.update(
            db,
            report,
            doctor_verified=normalized,
            doctor_comments=comments,
            verified_by=doctor_id,
        )

        return {
            "message": f"Report {normalized}",
            "report_id": report.report_id,
        }


report_service = ReportService()
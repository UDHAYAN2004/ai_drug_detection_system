from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path
from app.ai_engine.ocr_engine import ocr_engine
from app.ai_engine.drug_detector import drug_detector
from app.repositories.report_repository import report_repository
from app.repositories.investigation_repository import investigation_repository
from app.models.report_model import MedicalReport
from app.constants.drug_risk_levels import ReportStatus, RiskLevel, InvestigationStatus
from app.utils.logger import logger


class DrugDetectionService:
    """Orchestrates the full OCR → AI Detection → Investigation pipeline."""

    def process_report(self, db: Session, report: MedicalReport, language: str = "en") -> dict:
        """
        Full pipeline:
        1. OCR extraction
        2. AI drug detection
        3. Auto-create investigation if drug found
        """
        logger.info(f"Starting processing pipeline for report: {report.report_id}")

        # Step 1: Update status to processing
        report_repository.update_processing_status(db, report, ReportStatus.PROCESSING)

        try:
            # Step 2: OCR
            extracted_text, ocr_confidence = ocr_engine.extract_text(report.file_path, language)

            if not extracted_text or len(extracted_text.strip()) < 10:
                logger.warning(f"Low quality OCR for report {report.report_id}")
                # Still proceed but with low confidence

            # Update OCR results
            report_repository.update_ocr_results(db, report, extracted_text, ocr_confidence)
            logger.info(f"OCR complete for {report.report_id}, confidence={ocr_confidence:.2f}")

            # Step 3: AI Drug Detection
            detection_result = drug_detector.detect(extracted_text, ocr_confidence)

            detected_drugs = detection_result["detected_drugs"]
            risk_level = detection_result["overall_risk_level"]
            ai_confidence = detection_result["ai_confidence"]
            drug_detected = detection_result["drug_detected"]
            analysis_details = detection_result["analysis_details"]

            # Update AI results
            report_repository.update_ai_results(
                db=db,
                report=report,
                drug_detected=drug_detected,
                detected_drugs=detected_drugs,
                risk_level=risk_level.value if risk_level else None,
                ai_confidence=ai_confidence,
                analysis_details=analysis_details,
            )
            logger.info(
                f"AI detection complete for {report.report_id}. "
                f"Drug detected: {drug_detected}, Drugs: {detected_drugs}"
            )

            # Step 4: Auto-create investigation if drug detected
            investigation = None
            if drug_detected and risk_level:
                existing = investigation_repository.get_by_report_id(db, report.id)
                if not existing:
                    investigation = investigation_repository.create(
                        db=db,
                        athlete_id=report.athlete_id,
                        report_id=report.id,
                        detected_drugs=detected_drugs,
                        risk_level=risk_level,
                    )
                    logger.info(f"Investigation auto-created: {investigation.case_id}")

            return {
                "success": True,
                "report_id": report.report_id,
                "drug_detected": drug_detected,
                "detected_drugs": detected_drugs,
                "risk_level": risk_level.value if risk_level else None,
                "ai_confidence": ai_confidence,
                "ocr_confidence": ocr_confidence,
                "extracted_text": extracted_text,
                "analysis_details": analysis_details,
                "investigation_case_id": investigation.case_id if investigation else None,
                "message": self._generate_result_message(drug_detected, detected_drugs, risk_level),
            }

        except Exception as e:
            logger.error(f"Processing failed for report {report.report_id}: {e}")
            report_repository.update_processing_status(
                db, report, ReportStatus.FAILED, error=str(e)
            )
            raise RuntimeError(f"Report processing failed: {str(e)}")

    def reprocess_report(self, db: Session, report_id: int, language: str = "en") -> dict:
        """Reprocess a previously processed report."""
        report = report_repository.get_by_id(db, report_id)
        if not report:
            raise ValueError(f"Report {report_id} not found")
        if not Path(report.file_path).exists():
            raise FileNotFoundError(f"Report file not found: {report.file_path}")
        return self.process_report(db, report, language)

    def _generate_result_message(self, drug_detected: bool, drugs: list, risk_level: Optional[RiskLevel]) -> str:
        if not drug_detected:
            return "Analysis complete. No banned substances detected. Report is clean."
        drug_names = ", ".join(drugs)
        risk_str = risk_level.value.upper() if risk_level else "UNKNOWN"
        return (
            f"ALERT: Banned substance(s) detected: {drug_names}. "
            f"Risk Level: {risk_str}. "
            f"An investigation case has been automatically created."
        )

    def check_drug_query(self, drug_name: str) -> dict:
        """Check if a specific drug is banned (for chatbot/search)."""
        return drug_detector.check_single_drug(drug_name)


drug_detection_service = DrugDetectionService()

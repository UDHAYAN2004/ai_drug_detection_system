import pytest
import uuid
from app.services.investigation_service import investigation_service
from app.constants.drug_risk_levels import InvestigationStatus, RiskLevel


class TestInvestigationService:

    def test_create_investigation(self, db, athlete_user):
        user, athlete = athlete_user
        from app.models.report_model import MedicalReport
        from app.constants.drug_risk_levels import DrugDetectionStatus
        from app.utils.helpers import generate_report_id
        report = MedicalReport(
            report_id=generate_report_id(),
            athlete_id=athlete.id,
            file_path="/tmp/test.pdf",
            file_name="test.pdf",
            file_type="pdf",
            detection_status=DrugDetectionStatus.DETECTED,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        investigation = investigation_service.create_investigation(
            db,
            athlete_id=athlete.id,
            report_id=report.id,
            detected_drug="Nandrolone",
            risk_level=RiskLevel.HIGH,
        )
        assert investigation.case_id.startswith("CASE-")
        assert investigation.status == InvestigationStatus.PENDING
        assert investigation.detected_drug == "Nandrolone"
        assert investigation.risk_level == RiskLevel.HIGH
        assert isinstance(investigation.timeline, list)
        assert len(investigation.timeline) == 1

    def test_update_investigation_status(self, db, athlete_user):
        user, athlete = athlete_user
        from app.models.report_model import MedicalReport
        from app.constants.drug_risk_levels import DrugDetectionStatus
        from app.utils.helpers import generate_report_id
        report = MedicalReport(
            report_id=generate_report_id(),
            athlete_id=athlete.id,
            file_path="/tmp/test.pdf",
            file_name="test.pdf",
            file_type="pdf",
            detection_status=DrugDetectionStatus.DETECTED,
        )
        db.add(report)
        db.commit()

        inv = investigation_service.create_investigation(
            db, athlete_id=athlete.id, report_id=report.id,
            detected_drug="Stanozolol", risk_level=RiskLevel.HIGH,
        )

        updated = investigation_service.update_status(
            db, inv.case_id, InvestigationStatus.UNDER_REVIEW, "Doctor assigned"
        )
        assert updated.status == InvestigationStatus.UNDER_REVIEW
        assert len(updated.timeline) >= 1

    def test_update_nonexistent_investigation(self, db):
        with pytest.raises(Exception):
            investigation_service.update_status(db, "CASE-FAKE-00000", InvestigationStatus.CLEARED)

    def test_get_by_athlete_empty(self, db, athlete_user):
        user, athlete = athlete_user
        investigations = investigation_service.get_by_athlete(db, athlete.id)
        assert investigations == []


class TestInvestigationAPI:

    def test_get_my_cases_empty(self, client, athlete_token, athlete_user):
        resp = client.get(
            "/api/v1/investigations/my-cases",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_all_investigations_as_doctor(self, client, doctor_token):
        resp = client.get(
            "/api/v1/investigations/all",
            headers={"Authorization": f"Bearer {doctor_token}"},
        )
        assert resp.status_code == 200

    def test_athlete_cannot_see_all_investigations(self, client, athlete_token):
        resp = client.get(
            "/api/v1/investigations/all",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 403

    def test_get_investigation_not_found(self, client, athlete_token):
        resp = client.get(
            "/api/v1/investigations/CASE-NOTEXIST-99999",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 404

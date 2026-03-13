import pytest
import io
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


class TestReportAPI:

    def test_get_my_reports_empty(self, client, athlete_token, athlete_user):
        resp = client.get(
            "/api/v1/reports/my-reports",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_my_reports_unauthorized(self, client):
        resp = client.get("/api/v1/reports/my-reports")
        assert resp.status_code in (401, 403)

    def test_get_report_not_found(self, client, athlete_token):
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        resp = client.get(
            f"/api/v1/reports/{fake_uuid}",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 404

    def test_upload_report_invalid_format(self, client, athlete_token):
        fake_file = io.BytesIO(b"fake content")
        resp = client.post(
            "/api/v1/reports/upload",
            headers={"Authorization": f"Bearer {athlete_token}"},
            files={"file": ("test.exe", fake_file, "application/octet-stream")},
        )
        assert resp.status_code == 400

    def test_admin_get_all_reports(self, client, admin_token):
        resp = client.get(
            "/api/v1/reports/admin/all",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_athlete_cannot_access_admin_reports(self, client, athlete_token):
        resp = client.get(
            "/api/v1/reports/admin/all",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code in (401, 403)

    @patch("app.services.report_service.ocr_engine")
    @patch("app.services.report_service.drug_detector")
    @patch("app.utils.file_upload.save_upload_file")
    def test_upload_report_clean(self, mock_save, mock_detector, mock_ocr, client, athlete_token):
        mock_save.return_value = {
            "file_path": "/tmp/test.jpg",
            "file_name": "test.jpg",
            "file_type": "jpg",
            "file_size": 100.0,
        }
        mock_ocr.process_file.return_value = {
            "text": "No banned substances detected. Clean report.",
            "confidence": 0.95,
            "success": True,
        }
        from app.constants.drug_risk_levels import DrugDetectionStatus
        mock_detector.detect.return_value = {
            "status": DrugDetectionStatus.CLEAN,
            "detected_drugs": [],
            "risk_level": None,
            "confidence_score": 0.85,
            "match_details": [],
            "health_risks": [],
            "total_drugs_found": 0,
        }
        fake_file = io.BytesIO(b"fake image content")
        resp = client.post(
            "/api/v1/reports/upload",
            headers={"Authorization": f"Bearer {athlete_token}"},
            files={"file": ("test.jpg", fake_file, "image/jpeg")},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "report_id" in data
        assert data["detection_status"] == "clean"

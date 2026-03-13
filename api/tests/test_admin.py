import pytest


class TestAdminAPI:

    def test_admin_dashboard(self, client, admin_token):
        resp = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_athletes" in data
        assert "total_reports" in data

    def test_get_all_users(self, client, admin_token):
        resp = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_athlete_cannot_access_admin(self, client, athlete_token):
        resp = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_doctor_cannot_access_admin(self, client, doctor_token):
        resp = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {doctor_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_get_activity_logs(self, client, admin_token):
        resp = client.get(
            "/api/v1/admin/activity-logs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200


class TestChatbot:

    def test_chatbot_drug_query(self, client, athlete_token):
        resp = client.post(
            "/api/v1/chatbot/chat",
            json={"message": "Is nandrolone banned?"},
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert "confidence" in data
        assert data["confidence"] > 0

    def test_chatbot_general_query(self, client, athlete_token):
        resp = client.post(
            "/api/v1/chatbot/chat",
            json={"message": "What is doping?"},
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 200
        assert "reply" in resp.json()

    def test_chatbot_wada_query(self, client, athlete_token):
        resp = client.post(
            "/api/v1/chatbot/chat",
            json={"message": "Tell me about WADA rules"},
            headers={"Authorization": f"Bearer {athlete_token}"},
        )
        assert resp.status_code == 200

    def test_chatbot_unauthorized(self, client):
        resp = client.post("/api/v1/chatbot/chat", json={"message": "test"})
        assert resp.status_code in (401, 403)


class TestHealthCheck:

    def test_health_endpoint(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200

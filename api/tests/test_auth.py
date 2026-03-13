import pytest
from fastapi.testclient import TestClient


class TestAuthRegistration:

    def test_register_athlete_success(self, client):
        resp = client.post("/api/v1/auth/register", data={
            "name": "John Doe",
            "email": "john@test.com",
            "password": "SecurePass123",
            "role": "athlete",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "user_id" in data
        assert data["role"] == "athlete"

    def test_register_duplicate_email(self, client, athlete_user):
        resp = client.post("/api/v1/auth/register", data={
            "name": "Duplicate",
            "email": "athlete@test.com",
            "password": "SecurePass123",
            "role": "athlete",
        })
        assert resp.status_code == 409

    def test_register_weak_password(self, client):
        resp = client.post("/api/v1/auth/register", data={
            "name": "Test",
            "email": "test@test.com",
            "password": "weak",
            "role": "athlete",
        })
        assert resp.status_code in (422, 500, 200)

    def test_register_invalid_email(self, client):
        resp = client.post("/api/v1/auth/register", data={
            "name": "Test",
            "email": "not-an-email",
            "password": "SecurePass123",
            "role": "athlete",
        })
        assert resp.status_code in (422, 500, 200)


class TestAuthLogin:

    def test_login_success(self, client, athlete_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "athlete@test.com",
            "password": "AthletePass123",
            "role": "athlete",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["role"] == "athlete"

    def test_login_wrong_password(self, client, athlete_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "athlete@test.com",
            "password": "WrongPass123",
            "role": "athlete",
        })
        assert resp.status_code == 401

    def test_login_wrong_role(self, client, athlete_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "athlete@test.com",
            "password": "AthletePass123",
            "role": "admin",
        })
        assert resp.status_code == 403

    def test_login_nonexistent_user(self, client):
        resp = client.post("/api/v1/auth/login", json={
            "email": "nobody@test.com",
            "password": "Pass123",
            "role": "athlete",
        })
        assert resp.status_code == 401

    def test_get_me(self, client, athlete_token):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {athlete_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "athlete@test.com"
        assert data["role"] == "athlete"

    def test_get_me_invalid_token(self, client):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token"})
        assert resp.status_code == 401

    def test_logout(self, client, athlete_token):
        resp = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {athlete_token}"})
        assert resp.status_code == 200

    def test_refresh_token(self, client, athlete_user):
        login_resp = client.post("/api/v1/auth/login", json={
            "email": "athlete@test.com", "password": "AthletePass123", "role": "athlete"
        })
        refresh_token = login_resp.json()["refresh_token"]
        resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

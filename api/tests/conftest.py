import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

import os
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test-secret-key-32-chars-minimum!!"
os.environ["APP_ENV"] = "testing"

from app.database.base import Base
from app.database.session import get_db
from app.main import app

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    from app.utils.security import hash_password
    from app.models.user_model import User
    from app.constants.roles import UserRole, UserStatus
    user = User(
        name="Admin User",
        email="admin@test.com",
        hashed_password=hash_password("AdminPass123"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def athlete_user(db):
    from app.utils.security import hash_password
    from app.models.user_model import User
    from app.models.athlete_model import Athlete
    from app.constants.roles import UserRole, UserStatus
    user = User(
        name="Test Athlete",
        email="athlete@test.com",
        hashed_password=hash_password("AthletePass123"),
        role=UserRole.ATHLETE,
        status=UserStatus.ACTIVE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    athlete = Athlete(user_id=user.id, sport="Athletics", nationality="India")
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return user, athlete


@pytest.fixture
def doctor_user(db):
    from app.utils.security import hash_password
    from app.models.user_model import User
    from app.constants.roles import UserRole, UserStatus
    user = User(
        name="Test Doctor",
        email="doctor@test.com",
        hashed_password=hash_password("DoctorPass123"),
        role=UserRole.DOCTOR,
        status=UserStatus.ACTIVE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com", "password": "AdminPass123", "role": "admin"
    })
    return resp.json()["access_token"]


@pytest.fixture
def athlete_token(client, athlete_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "athlete@test.com", "password": "AthletePass123", "role": "athlete"
    })
    return resp.json()["access_token"]


@pytest.fixture
def doctor_token(client, doctor_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "doctor@test.com", "password": "DoctorPass123", "role": "doctor"
    })
    return resp.json()["access_token"]


from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time

from app.config.settings import settings
from app.config.environment import create_required_directories
from app.database.connection import engine
from app.database.base import Base
from app.utils.logger import logger

# Import models (important for table creation)
from app.models import (
    user_model,
    athlete_model,
    report_model,
    drug_model,
    investigation_model,
    ban_model,
    activity_log_model
)

# Import routers
from app.api import (
    auth_routes,
    athlete_routes,
    report_routes,
    investigation_routes,
    doctor_routes,
    admin_routes,
    analytics_routes,
    chatbot_routes
)


# ─────────────────────────────────────────────
# Application Lifespan
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    create_required_directories()

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready")

    yield

    logger.info("Application shutdown")


# ─────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Medical Drug Detection System",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ─────────────────────────────────────────────
# CORS Middleware (VERY IMPORTANT)
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Request Timing Middleware
# ─────────────────────────────────────────────
@app.middleware("http")
async def process_time_middleware(request: Request, call_next):

    start_time = time.time()

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = str(round(process_time, 2))

    return response


# ─────────────────────────────────────────────
# Validation Error Handler
# ─────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):

    errors = []

    for error in exc.errors():
        errors.append({
            "field": " → ".join(str(e) for e in error["loc"]),
            "message": error["msg"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        },
    )


# ─────────────────────────────────────────────
# Global Error Handler
# ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ─────────────────────────────────────────────
# API Routers
# ─────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth_routes.router, prefix=API_PREFIX)
app.include_router(athlete_routes.router, prefix=API_PREFIX)
app.include_router(report_routes.router, prefix=API_PREFIX)
app.include_router(investigation_routes.router, prefix=API_PREFIX)
app.include_router(doctor_routes.router, prefix=API_PREFIX)
app.include_router(admin_routes.router, prefix=API_PREFIX)
app.include_router(analytics_routes.router, prefix=API_PREFIX)
app.include_router(chatbot_routes.router, prefix=API_PREFIX)


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


# ─────────────────────────────────────────────
# Root
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


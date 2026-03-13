from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool
from app.config.settings import settings
from app.utils.logger import logger


def get_engine():
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=settings.DEBUG,
    )

    @event.listens_for(engine, "connect")
    def connect(dbapi_connection, connection_record):
        logger.debug("New database connection established")

    @event.listens_for(engine, "checkout")
    def checkout(dbapi_connection, connection_record, connection_proxy):
        logger.debug("Database connection checked out from pool")

    return engine


engine = get_engine()

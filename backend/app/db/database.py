from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from .models import Base

# Database URL for SQLite
DATABASE_URL: str = "sqlite+aiosqlite:///./documents.db"

# Create async engine
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=True)

# Create async session factory
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db() -> None:
    """
    Initializes database tables using SQLAlchemy metadata.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a database session.
    """
    async with async_session() as session:
        yield session

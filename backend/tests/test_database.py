
from app.db.database import get_db
import pytest
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_get_db_session():
    gen = get_db()
    session = await anext(gen)
    assert isinstance(session, AsyncSession)
    await gen.aclose()

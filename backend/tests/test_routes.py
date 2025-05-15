
import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import get_db
from app.api.routes import get_documents, get_document, update_document, get_document_image
from app.models.schema import ExtractedDocument
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_get_documents_empty():
    async for db in get_db():
        response = await get_documents(db=db)
        assert response == []

@pytest.mark.asyncio
async def test_get_documents():
    async for db in get_db():
        docs = await get_documents(db=db)
        assert isinstance(docs, list)

@pytest.mark.asyncio
async def test_get_single_document():
    async for db in get_db():
        docs = await get_documents(db=db)
        if docs:
            doc = await get_document(document_id=docs[0].id, db=db)
            assert doc.id == docs[0].id

@pytest.mark.asyncio
async def test_update_document():
    async for db in get_db():
        docs = await get_documents(db=db)
        if docs:
            payload = ExtractedDocument(
                document_type="passport",
                document_content={"full_name": "Test User", "date_of_birth": "2000-01-01"}
            )
            updated = await update_document(document_id=docs[0].id, data=payload, db=db)
            assert updated.document_type == "passport"

@pytest.mark.asyncio
async def test_get_document_image_not_found():
    async for db in get_db():
        try:
            await get_document_image(document_id=9999999, db=db)
        except HTTPException as e:
            assert e.status_code == 404

@pytest.mark.asyncio
async def test_get_document_not_found():
    async for db in get_db():
        try:
            await get_document(document_id=9999999, db=db)
        except HTTPException as e:
            assert e.status_code == 404

@pytest.mark.asyncio
async def test_update_document_not_found():
    async for db in get_db():
        payload = ExtractedDocument(
            document_type="passport",
            document_content={"full_name": "Test User", "date_of_birth": "2000-01-01"}
        )
        try:
            await update_document(document_id=9999999, data=payload, db=db)
        except HTTPException as e:
            assert e.status_code == 404

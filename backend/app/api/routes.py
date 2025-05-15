from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import os
import traceback
from datetime import datetime
from typing import List

from app.services.document_processor import process_document
from app.db.database import get_db
from app.db.models import DocumentRecord
from app.models.schema import DocumentResponse, DocumentCreate, ExtractedDocument

router = APIRouter(prefix="/api")

# Ensure uploads folder exists
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/process-document", response_model=DocumentResponse, summary="Process and extract a new document")
async def process_document_endpoint(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    """
    Accepts a file, processes it to extract document data using AI, and stores it in the DB.
    """
    file_ext: str = os.path.splitext(file.filename or "")[1] or ".pdf"
    temp_path: str = os.path.join(UPLOADS_DIR, f"{uuid.uuid4()}{file_ext}")
    
    try:
        # Save file
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        
        # Process via document processor
        result = await process_document(temp_path)

        # Prepare ORM object
        db_record = DocumentRecord(
            file_name=file.filename or "unknown",
            document_type=result.document_type,
            extracted_data=result.document_content,
            file_path=temp_path,
            created_at=datetime.now()
        )

        db.add(db_record)
        await db.commit()
        await db.refresh(db_record)

        return DocumentResponse(
            id=db_record.id,
            file_name=db_record.file_name,
            document_type=db_record.document_type,
            document_content=db_record.extracted_data,
            created_at=db_record.created_at
        )

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print("Error processing document:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@router.get("/documents", response_model=List[DocumentResponse], summary="List all documents")
async def get_documents(db: AsyncSession = Depends(get_db)) -> List[DocumentResponse]:
    result = await db.execute(DocumentRecord.select().order_by(DocumentRecord.created_at.desc()))
    records = result.scalars().all()

    return [
        DocumentResponse(
            id=record.id,
            file_name=record.file_name,
            document_type=record.document_type,
            document_content=record.extracted_data,
            created_at=record.created_at
        ) for record in records
    ]

@router.get("/documents/{document_id}", response_model=DocumentResponse, summary="Fetch a specific document by ID")
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)) -> DocumentResponse:
    result = await db.execute(DocumentRecord.select().where(DocumentRecord.id == document_id))
    record = result.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    return DocumentResponse(
        id=record.id,
        file_name=record.file_name,
        document_type=record.document_type,
        document_content=record.extracted_data,
        created_at=record.created_at
    )

@router.put("/documents/{document_id}", response_model=DocumentResponse, summary="Update extracted document data")
async def update_document(
    document_id: int,
    data: ExtractedDocument,
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    result = await db.execute(DocumentRecord.select().where(DocumentRecord.id == document_id))
    record = result.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Document not found")

    record.document_type = data.document_type
    record.extracted_data = data.document_content

    await db.commit()
    await db.refresh(record)

    return DocumentResponse(
        id=record.id,
        file_name=record.file_name,
        document_type=record.document_type,
        document_content=record.extracted_data,
        created_at=record.created_at
    )

@router.get("/documents/{document_id}/image", summary="Download the original document image")
async def get_document_image(document_id: int, db: AsyncSession = Depends(get_db)) -> FileResponse:
    result = await db.execute(DocumentRecord.select().where(DocumentRecord.id == document_id))
    record = result.scalars().first()

    if not record or not os.path.exists(record.file_path):
        raise HTTPException(status_code=404, detail="Document image not found")

    return FileResponse(record.file_path)

__all__ = ["router"]

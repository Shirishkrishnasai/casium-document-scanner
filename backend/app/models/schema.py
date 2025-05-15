from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional

class ExtractedDocument(BaseModel):
    document_type: str
    document_content: Dict[str, Any]

class DocumentCreate(BaseModel):
    file_name: str
    document_type: str
    extracted_data: Dict[str, Any]
    file_path: str
    created_at: datetime

class DocumentResponse(BaseModel):
    id: int
    file_name: str
    document_type: str
    document_content: Dict[str, Any]
    created_at: datetime
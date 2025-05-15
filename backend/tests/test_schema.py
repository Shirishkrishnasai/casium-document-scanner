
from app.models.schema import DocumentResponse

def test_document_response_model():
    data = {
        "id": 1,
        "file_name": "test.jpg",
        "document_type": "passport",
        "document_content": {"full_name": "John Doe"},
        "created_at": "2024-05-01T00:00:00"
    }
    doc = DocumentResponse(**data)
    assert doc.file_name == "test.jpg"
    assert doc.document_type == "passport"

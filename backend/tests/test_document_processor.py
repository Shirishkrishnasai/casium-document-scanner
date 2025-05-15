import pytest
from app.services.document_processor import normalize_data, extract_fields
from datetime import datetime
import json

@pytest.mark.asyncio
async def test_extract_fields_invalid_type():
    # Should return empty for unknown document type
    result = await extract_fields("fake_base64", "unknown_type")
    assert result == {}

def test_normalize_data_handles_invalid_date():
    data = {"issue_date": "invalid_date"}
    normalized = normalize_data(data)
    assert normalized["issue_date"] == "invalid_date"

def test_normalize_data_handles_name_split():
    data = {"full_name": "John Doe"}
    normalized = normalize_data(data)
    assert normalized["first_name"] == "John"
    assert normalized["last_name"] == "Doe"

def test_normalize_data_handles_single_name():
    data = {"full_name": "Prince"}
    normalized = normalize_data(data)
    assert normalized["full_name"] == "Prince"

def test_normalize_data_with_non_string_value():
    data = {"issue_date": 12345}
    normalized = normalize_data(data)
    assert normalized["issue_date"] == 12345

def test_normalize_data_valid_date_format():
    data = {"expiration_date": "12/31/2024"}
    normalized = normalize_data(data)
    assert normalized["expiration_date"] == "2024-12-31"
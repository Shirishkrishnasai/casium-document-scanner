import os
import io
import json
import base64
from typing import Dict, Any
from datetime import datetime

from PIL import Image
from pdf2image import convert_from_path
from dotenv import load_dotenv
import aiofiles

from openai import AsyncOpenAI

from app.models.schema import ExtractedDocument

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Supported document field definitions
DOCUMENT_TYPES: Dict[str, list[str]] = {
    "passport": ["full_name", "date_of_birth", "country", "issue_date", "expiration_date"],
    "driver_license": ["license_number", "date_of_birth", "issue_date", "expiration_date", "first_name", "last_name"],
    "ead_card": ["card_number", "category", "card_expires_date", "last_name", "first_name"]
}


async def process_document(file_path: str) -> ExtractedDocument:
    """
    Process an uploaded document and extract structured data.

    Args:
        file_path (str): Path to the image or PDF file.

    Returns:
        ExtractedDocument: Document type and extracted content.
    """
    if file_path.lower().endswith('.pdf'):
        pages = convert_from_path(file_path)
        if not pages:
            raise ValueError("Failed to convert PDF to image")
        image = pages[0]
        with io.BytesIO() as img_bytes:
            image.save(img_bytes, format='JPEG')
            img_data = img_bytes.getvalue()
    else:
        async with aiofiles.open(file_path, 'rb') as f:
            img_data = await f.read()

    base64_image = base64.b64encode(img_data).decode('utf-8')

    document_type = await classify_document(base64_image)
    extracted_fields = await extract_fields(base64_image, document_type)
    normalized_fields = normalize_data(extracted_fields)

    return ExtractedDocument(
        document_type=document_type,
        document_content=normalized_fields
    )


async def classify_document(base64_image: str) -> str:
    """
    Classify the document type using OpenAI Vision.

    Args:
        base64_image (str): Base64-encoded image.

    Returns:
        str: One of ['passport', 'driver_license', 'ead_card', 'unknown'].
    """
    prompt = """
    Analyze this image and identify what type of identification document it is.
    Only respond with one of these categories: passport, driver_license, ead_card.
    If you cannot clearly identify the document type, respond with "unknown".
    """

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        max_tokens=50
    )

    doc_type = response.choices[0].message.content.strip().lower()
    return doc_type if doc_type in DOCUMENT_TYPES else "unknown"


async def extract_fields(base64_image: str, document_type: str) -> Dict[str, Any]:
    """
    Extract required fields based on document type.

    Args:
        base64_image (str): Base64-encoded image.
        document_type (str): Classified document type.

    Returns:
        Dict[str, Any]: Key-value field mappings.
    """
    fields = DOCUMENT_TYPES.get(document_type, [])
    if not fields:
        return {}

    prompt = f"""
    This is a {document_type}. Extract the following fields: {", ".join(fields)}.
    Format your response as a JSON object with keys and values.
    Example:
    {{
        "field_name": "value"
    }}
    """

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        max_tokens=300
    )

    try:
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.strip("```")
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except Exception as e:
        print(f"[Error] Failed to parse JSON: {e}")
        return {}


def normalize_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize extracted field data, especially dates and names.

    Args:
        data (Dict[str, Any]): Extracted raw field data.

    Returns:
        Dict[str, Any]: Cleaned and normalized fields.
    """
    normalized: Dict[str, Any] = {}

    for key, value in data.items():
        if not isinstance(value, str):
            normalized[key] = value
            continue

        lower_key = key.lower()
        if any(field in lower_key for field in ["date", "issue", "expiry", "expires", "expiration"]):
            for fmt in ["%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d", "%m-%d-%Y", "%d-%m-%Y", "%Y-%m-%d"]:
                try:
                    dt = datetime.strptime(value.strip(), fmt)
                    normalized[key] = dt.strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue
            else:
                normalized[key] = value
        elif "name" in lower_key and " " in value and "first" not in lower_key and "last" not in lower_key:
            parts = value.strip().split(" ", 1)
            if len(parts) == 2:
                normalized["first_name"] = parts[0]
                normalized["last_name"] = parts[1]
            else:
                normalized[key] = value
        else:
            normalized[key] = value

    return normalized

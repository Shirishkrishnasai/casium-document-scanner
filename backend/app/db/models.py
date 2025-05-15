from sqlalchemy import Column, Integer, String, DateTime, JSON, select
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, index=True)
    document_type = Column(String, index=True)
    extracted_data = Column(JSON)
    file_path = Column(String)
    created_at = Column(DateTime)

    @classmethod
    def select(cls):
        return select(cls)
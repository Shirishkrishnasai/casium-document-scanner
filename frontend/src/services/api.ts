import axios from 'axios';
import { DocumentData } from '../types/document';

const API_URL = 'http://localhost:8000/api';

// Fetch all documents
export const fetchDocuments = async (): Promise<DocumentData[]> => {
  const response = await axios.get(`${API_URL}/documents`);
  return response.data;
};

// Fetch a single document by ID
export const fetchDocument = async (id: number): Promise<DocumentData> => {
  const response = await axios.get(`${API_URL}/documents/${id}`);
  return response.data;
};

// Process a new document
export const processDocument = async (file: File): Promise<DocumentData> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/process-document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update a document's extracted information
export const updateDocument = async (
  id: number,
  documentType: string,
  documentContent: Record<string, string>
): Promise<DocumentData> => {
  const response = await axios.put(`${API_URL}/documents/${id}`, {
    document_type: documentType,
    document_content: documentContent,
  });
  
  return response.data;
};
// src/components/DocumentUploader.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { DocumentData } from '../types/document';

interface DocumentUploaderProps {
  onDocumentProcessed: (document: DocumentData) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<DocumentData>('http://localhost:8000/api/process-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onDocumentProcessed(response.data);
      setFile(null); // reset file after success
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 border rounded shadow">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fileUpload">
        Upload Document
      </label>
      <input
        id="fileUpload"
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default DocumentUploader;

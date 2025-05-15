import React from 'react';
import { DocumentData } from '../types/document';

interface DocumentHistoryProps {
  documents: DocumentData[];
  onDocumentSelected: (document: DocumentData) => void;
  selectedDocumentId: number | undefined;
  loading: boolean;
}

const DocumentHistory: React.FC<DocumentHistoryProps> = ({
  documents,
  onDocumentSelected,
  selectedDocumentId,
  loading
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'passport': 'Passport',
      'driver_license': 'Driver License',
      'ead_card': 'EAD Card'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {loading ? (
        <div className="p-4 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No documents processed yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <li 
              key={doc.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedDocumentId === doc.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onDocumentSelected(doc)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={doc.file_name}>
                    {doc.file_name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {getDocumentTypeDisplay(doc.document_type)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(doc.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentHistory;
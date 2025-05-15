import React, { useEffect, useState } from 'react';
import { updateDocument } from '../services/api';
import { DocumentData, DocumentField } from '../types/document';

interface DocumentViewerProps {
  document: DocumentData;
  onDocumentUpdated: (document: DocumentData) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onDocumentUpdated }) => {
  const [fields, setFields] = useState<DocumentField[]>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convert document content to fields array for editing
  useEffect(() => {
    const fieldList: DocumentField[] = Object.entries(document.document_content).map(([key, value]) => ({
      key,
      value: value || '',
      label: formatFieldName(key)
    }));
    
    setFields(fieldList);
  }, [document]);

  // Format field name for display (e.g. "first_name" -> "First Name")
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle field value change
  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[index].value = value;
    setFields(updatedFields);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Convert fields array back to document content object
      const updatedContent: Record<string, string> = {};
      fields.forEach(field => {
        updatedContent[field.key] = field.value;
      });
      
      // Submit update to API
      const updatedDocument = await updateDocument(
        document.id,
        document.document_type,
        updatedContent
      );
      
      // Update parent component with new data
      onDocumentUpdated(updatedDocument);
      setEditing(false);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document. Please try again.');
      setLoading(false);
    }
  };

  // Format document type for display
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
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {getDocumentTypeDisplay(document.document_type)}
          </h3>
          <p className="text-sm text-gray-500">{document.file_name}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`py-2 px-4 rounded-md text-sm font-medium ${
            editing ?
              'bg-gray-200 text-gray-800 hover:bg-gray-300' :
              'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editing ? 'Cancel' : 'Edit Fields'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left column: Document Image */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Document</h4>
          <div className="border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center h-96">
            <img
              src={`/api/documents/${document.id}/image`}
              alt="Document Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3C/svg%3E`;
                target.alt = "Document preview unavailable";
                target.className = "w-16 h-16 text-gray-400";
              }}
            />
          </div>
        </div>

        {/* Right column: Extracted Fields */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {editing ? 'Edit Extracted Fields' : 'Extracted Fields'}
          </h4>
          
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.key} className="border rounded-md p-3">
                <label className="block text-xs font-medium text-gray-500">
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 text-sm text-gray-900 break-words">
                    {field.value || <span className="text-gray-400 italic">Not available</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {editing && (
            <div className="mt-6">
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
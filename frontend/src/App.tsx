import { useEffect, useState } from 'react';
import './App.css';
import DocumentHistory from './components/DocumentHistory';
import DocumentUploader from './components/DocumentUploader';
import DocumentViewer from './components/DocumentViewer';
import { fetchDocuments } from './services/api';
import { DocumentData } from './types/document';

function App() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await fetchDocuments();
      setDocuments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load documents');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDocumentSelected = (document: DocumentData) => {
    setSelectedDocument(document);
  };

  const handleDocumentProcessed = (document: DocumentData) => {
    setDocuments((prevDocs) => [document, ...prevDocs]);
    setSelectedDocument(document);
  };

  const handleDocumentUpdated = (updatedDocument: DocumentData) => {
    setDocuments((prevDocs) => 
      prevDocs.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
    );
    setSelectedDocument(updatedDocument);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Scanner</h1>
      </header>
      <main className="App-main">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <h2 className="text-xl font-bold mb-4">Upload Document</h2>
              <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />
              
              <h2 className="text-xl font-bold mt-8 mb-4">Recent Documents</h2>
              <DocumentHistory 
                documents={documents} 
                onDocumentSelected={handleDocumentSelected}
                selectedDocumentId={selectedDocument?.id} 
                loading={loading}
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Document Viewer</h2>
              {selectedDocument ? (
                <DocumentViewer 
                  document={selectedDocument} 
                  onDocumentUpdated={handleDocumentUpdated}
                />
              ) : (
                <div className="bg-gray-100 border rounded-lg p-8 text-center">
                  <p className="text-gray-500">No document selected. Upload a new document or select one from the history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-4 right-4">
          <span>{error}</span>
          <button 
            className="ml-2 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
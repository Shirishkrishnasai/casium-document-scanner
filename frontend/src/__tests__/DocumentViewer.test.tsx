import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentViewer from '../components/DocumentViewer';

test('renders DocumentViewer with document fields', () => {
  const doc = {
    id: 1,
    file_name: "sample.jpg",
    document_type: "passport",
    document_content: { full_name: "John Doe", country: "USA" },
    created_at: "2024-01-01T00:00:00Z"
  };
  render(<DocumentViewer document={doc} onDocumentUpdated={() => {}} />);
  expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
});
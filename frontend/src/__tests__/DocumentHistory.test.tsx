import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentHistory from '../components/DocumentHistory';

test('renders document history items', () => {
  const documents = [
    { id: 1, file_name: "doc1.png", document_type: "passport", document_content: {}, created_at: "2024-01-01T00:00:00Z" }
  ];
  render(<DocumentHistory documents={documents} onDocumentSelected={() => {}} selectedDocumentId={1} loading={false} />);
  expect(screen.getByText("doc1.png")).toBeInTheDocument();
});
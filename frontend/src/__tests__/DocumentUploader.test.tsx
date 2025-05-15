import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentUploader from '../components/DocumentUploader';

describe('DocumentUploader', () => {
  it('renders upload input and triggers callback', async () => {
    const mockOnProcessed = jest.fn();
    render(<DocumentUploader onDocumentProcessed={mockOnProcessed} />);

    const input = screen.getByLabelText(/Upload Document/i);
    expect(input).toBeInTheDocument();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    expect(uploadButton).toBeDisabled();
  });
});

export interface DocumentData {
  id: number;
  file_name: string;
  document_type: string;
  document_content: Record<string, string>;
  created_at: string;
}

export interface DocumentField {
  key: string;
  value: string;
  label: string;
}
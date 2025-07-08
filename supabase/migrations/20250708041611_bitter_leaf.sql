/*
  # Create document versions table

  1. New Tables
    - `document_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `content` (text)
      - `version_number` (integer)
      - `created_at` (timestamp)
      - `changes_summary` (text)

  2. Security
    - Enable RLS on `document_versions` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content text NOT NULL,
  version_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  changes_summary text DEFAULT ''
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read versions of their documents"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_versions.document_id 
      AND (documents.user_id = auth.uid() OR auth.email() = ANY(documents.collaborators))
    )
  );

CREATE POLICY "Users can create versions of their documents"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_versions.document_id 
      AND (documents.user_id = auth.uid() OR auth.email() = ANY(documents.collaborators))
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(document_id, version_number);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at);

-- Create unique constraint to prevent duplicate version numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_versions_unique 
ON document_versions(document_id, version_number);
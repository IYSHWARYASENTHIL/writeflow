/*
  # Create suggestions table

  1. New Tables
    - `suggestions`
      - `id` (text, primary key)
      - `document_id` (uuid, foreign key)
      - `type` (text)
      - `text` (text)
      - `suggestion` (text)
      - `explanation` (text)
      - `position` (jsonb)
      - `severity` (text)
      - `confidence` (numeric)
      - `created_at` (timestamp)
      - `is_applied` (boolean)
      - `is_dismissed` (boolean)
      - `applied_at` (timestamp)
      - `dismissed_at` (timestamp)

  2. Security
    - Enable RLS on `suggestions` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS suggestions (
  id text PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  type text NOT NULL,
  text text NOT NULL,
  suggestion text NOT NULL,
  explanation text NOT NULL,
  position jsonb NOT NULL,
  severity text NOT NULL,
  confidence numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_applied boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  applied_at timestamptz,
  dismissed_at timestamptz
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read suggestions for their documents"
  ON suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = suggestions.document_id 
      AND (documents.user_id = auth.uid() OR auth.email() = ANY(documents.collaborators))
    )
  );

CREATE POLICY "Users can create suggestions for their documents"
  ON suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = suggestions.document_id 
      AND (documents.user_id = auth.uid() OR auth.email() = ANY(documents.collaborators))
    )
  );

CREATE POLICY "Users can update suggestions for their documents"
  ON suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = suggestions.document_id 
      AND (documents.user_id = auth.uid() OR auth.email() = ANY(documents.collaborators))
    )
  );

CREATE POLICY "Users can delete suggestions for their documents"
  ON suggestions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = suggestions.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suggestions_document_id ON suggestions(document_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_type ON suggestions(type);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_is_applied ON suggestions(is_applied);
CREATE INDEX IF NOT EXISTS idx_suggestions_is_dismissed ON suggestions(is_dismissed);
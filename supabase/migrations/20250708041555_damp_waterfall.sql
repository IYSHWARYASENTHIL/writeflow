/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `word_count` (integer)
      - `reading_time` (integer)
      - `tags` (text array)
      - `language` (text)
      - `writing_goal` (text)
      - `is_public` (boolean)
      - `status` (text)
      - `version` (integer)
      - `collaborators` (text array)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  word_count integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  language text DEFAULT 'en-US',
  writing_goal text DEFAULT 'professional',
  is_public boolean DEFAULT false,
  status text DEFAULT 'draft',
  version integer DEFAULT 1,
  collaborators text[] DEFAULT '{}'
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true OR auth.email() = ANY(collaborators));

CREATE POLICY "Users can create own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.email() = ANY(collaborators));

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
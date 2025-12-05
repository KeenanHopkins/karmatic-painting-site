/*
  # Add file attachment support to form submissions

  1. Changes to existing table
    - Add `attachment_url` column to store the file URL
    - Add `attachment_name` column to store the original filename
    - Add `attachment_type` column to store the file MIME type

  2. Storage
    - Create a storage bucket called `form-attachments`
    - Enable public access for viewing attachments
    - Add RLS policies for bucket access

  3. Security
    - Allow authenticated and anon users to upload files (for form submissions)
    - Allow public read access to attachments
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN attachment_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN attachment_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN attachment_type text;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('form-attachments', 'form-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads to form-attachments"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'form-attachments');

CREATE POLICY "Allow public access to form-attachments"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'form-attachments');
/*
  # Update form submissions to support multiple attachments

  1. Changes
    - Remove single attachment columns (attachment_url, attachment_name, attachment_type)
    - Add attachments JSONB column to store array of attachment objects
    - Each attachment object contains: url, name, type

  2. Notes
    - Using JSONB allows storing unlimited attachments per submission
    - Each attachment has its own metadata for proper display
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN attachment_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN attachment_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE form_submissions DROP COLUMN attachment_type;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_submissions' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE form_submissions ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
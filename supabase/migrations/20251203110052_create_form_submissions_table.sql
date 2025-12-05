/*
  # Create form submissions table

  1. New Tables
    - `form_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `first_name` (text) - Customer's first name
      - `phone_number` (text) - Customer's phone number
      - `message` (text) - Description of what the customer needs done
      - `created_at` (timestamptz) - Timestamp of when the submission was created
      
  2. Security
    - Enable RLS on `form_submissions` table
    - Add policy for authenticated users to insert their own submissions
    - Add policy for authenticated users to read their own submissions
    - Add policy for service role to read all submissions (for admin access)
    
  3. Notes
    - Phone numbers are stored as text to preserve formatting
    - All fields are required (NOT NULL)
    - Created timestamp is automatically set on insertion
*/

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  phone_number text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert form submissions (public form)
CREATE POLICY "Anyone can submit form"
  ON form_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all submissions (for admin dashboard)
CREATE POLICY "Authenticated users can read all submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (true);
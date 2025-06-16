/*
  # Create chat logs table

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `session_id` (text, not null)
      - `role` (text, not null) - either 'user' or 'assistant'
      - `content` (text, not null)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `chat_logs` table
    - Add policy for authenticated users to read their own logs
    - Add policy for service role to insert logs
*/

CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat logs"
  ON chat_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Service role can insert chat logs"
  ON chat_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
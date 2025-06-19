/*
  # Chat logs table with RLS policies

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `role` (text, constrained to 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `chat_logs` table
    - Drop existing policies to avoid conflicts
    - Add policy for anonymous users to read chat logs
    - Add policy for service role to insert chat logs
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_logs' 
    AND policyname = 'Anyone can read chat logs'
  ) THEN
    DROP POLICY "Anyone can read chat logs" ON chat_logs;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_logs' 
    AND policyname = 'Service role can insert chat logs'
  ) THEN
    DROP POLICY "Service role can insert chat logs" ON chat_logs;
  END IF;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chat_logs_role_check CHECK (role IN ('user', 'assistant'))
);

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
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
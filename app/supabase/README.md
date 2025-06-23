# Supabase Database

Database migrations for the ISST AI Tutor application.

## Migration: `20250522092836_create_chat_logs_table.sql`

Creates the `chat_logs` table for storing conversation history with:

- Row Level Security (RLS) enabled
- Policies for anonymous read and service role insert
- UUID primary key and session tracking

## Setup

1. Create a new Supabase project
2. Run the migration SQL (./migrations/... .sql script) in the Supabase SQL Editor (on the online dashboard -> SQL Editor)
3. Configure environment variables in backend and frontend

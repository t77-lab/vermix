-- VerMix PostgreSQL / Supabase Database Schema
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  handle TEXT,
  city TEXT DEFAULT 'Samarkand, Uzbekistan',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT,
  url TEXT,
  saved_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

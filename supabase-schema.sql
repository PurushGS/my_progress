-- Supabase Database Schema for My Progress Dashboard
-- Run this SQL in your Supabase SQL Editor

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'completed')),
  velocity INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'dev-inprogress', 'review', 'ready-for-qa', 'qa-inprogress', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('feature', 'bug', 'improvement', 'technical-debt')),
  assignee TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  storyPoints INTEGER,
  sprintId TEXT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  completedAt TEXT,
  tags TEXT[] DEFAULT '{}',
  statusHistory JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Allow public read/write for now
-- You can restrict this later based on your needs
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for team collaboration)
-- In production, you might want to add authentication and restrict access
CREATE POLICY "Allow public read access to sprints" ON sprints
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to sprints" ON sprints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to sprints" ON sprints
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to sprints" ON sprints
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to tasks" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to tasks" ON tasks
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprintId);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updatedAt);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_start_date ON sprints(startDate);

-- Enable real-time for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;


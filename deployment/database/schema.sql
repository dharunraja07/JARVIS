-- ==============================================================================
-- J.A.R.V.I.S. Cloud PostgreSQL Database Schema
-- Production DDL script for Neon.tech, Supabase, or Render PostgreSQL
-- ==============================================================================

-- 1. Create memories table for persistent episodic and contextual memory
CREATE TABLE IF NOT EXISTS memories (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Performance indexes for fast category filtering and semantic keyword retrieval
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories (category);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_updated_at ON memories (updated_at DESC);

-- 3. Optional Full-Text Search (tsvector) index for sub-millisecond querying
CREATE INDEX IF NOT EXISTS idx_memories_content_trgm ON memories USING gin (to_tsvector('english', content));

-- Verification query
SELECT 'JARVIS Database schema successfully installed!' AS status;

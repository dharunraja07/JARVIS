# J.A.R.V.I.S. Managed PostgreSQL Database Setup

This guide walks through configuring a free, permanent cloud PostgreSQL database for J.A.R.V.I.S.

---

## Option 1: Neon.tech (Recommended — 100% Free & Serverless)

Neon provides free serverless PostgreSQL with 0.5 GB storage, instant branching, and autoscaling.

1. Navigate to [https://neon.tech](https://neon.tech) and sign up with GitHub.
2. Click **Create Project**:
   - Project Name: `jarvis-memory`
   - Postgres version: `16` (Default)
   - Cloud Region: Choose the region closest to you (e.g., AWS US-East or Asia-Singapore).
3. In the Neon Console Dashboard, copy your **Connection String**.
   - Select: `Pooled connection` (or direct)
   - Ensure the string format is:
     ```
     postgresql://<username>:<password>@<ep-hostname>.neon.tech/jarvis-memory?sslmode=require
     ```
4. Click **SQL Editor** in Neon console:
   - Copy the contents of `deployment/database/schema.sql` and paste it into the SQL editor.
   - Click **Run** to generate the `memories` table and indices.

---

## Option 2: Supabase (Alternative Free Option)

1. Sign in to [https://supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings -> Database** and copy the URI under **Connection string -> URI**.
3. Go to **SQL Editor**, paste `deployment/database/schema.sql`, and execute.

---

## Migrating Local Memories to Cloud PostgreSQL

Once your database is created, transfer your existing local SQLite memories:

```powershell
# 1. Preview records to be transferred
uv run python scripts/migrate_sqlite_to_pg.py --dry-run

# 2. Perform live migration
uv run python scripts/migrate_sqlite_to_pg.py --database-url "postgresql://<your-connection-string>?sslmode=require"
```

"""
JARVIS SQLite to PostgreSQL Migration Utility
Migrates local persistent SQLite episodic memories (src/database/jarvis_memory.db)
to cloud managed PostgreSQL (Neon, Supabase, Render PostgreSQL).

Usage:
  uv run python scripts/migrate_sqlite_to_pg.py --dry-run
  uv run python scripts/migrate_sqlite_to_pg.py --database-url "postgresql://..."
"""

import argparse
import os
import sqlite3
import sys
from pathlib import Path

# Ensure src is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "src"))

SQLITE_PATH = BASE_DIR / "src" / "database" / "jarvis_memory.db"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Migrate JARVIS SQLite memories to PostgreSQL."
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", ""),
        help="Target PostgreSQL connection URL (e.g. postgresql://user:pass@host/db)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect SQLite records and validate plan without writing to PostgreSQL.",
    )
    parser.add_argument(
        "--reset-target",
        action="store_true",
        help="Clear existing memories table in PostgreSQL before migrating.",
    )
    return parser.parse_args()


def load_sqlite_memories() -> list[dict]:
    if not SQLITE_PATH.exists():
        print(f"[!] SQLite database not found at {SQLITE_PATH}")
        return []

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, category, content, created_at, updated_at FROM memories ORDER BY id ASC"
        )
        rows = [dict(r) for r in cur.fetchall()]
        return rows
    except sqlite3.OperationalError as e:
        print(f"[!] Error querying SQLite memories table: {e}")
        return []
    finally:
        conn.close()


def migrate_to_postgres(
    target_url: str, records: list[dict], reset_target: bool = False
):
    import psycopg
    from psycopg.rows import dict_row

    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    print("Connecting to target PostgreSQL database...")
    conn = psycopg.connect(target_url, row_factory=dict_row)
    try:
        with conn.cursor() as cur:
            # Ensure schema
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS memories (
                    id SERIAL PRIMARY KEY,
                    category TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_memories_category ON memories (category);
                """
            )

            if reset_target:
                print("Resetting target memories table (--reset-target specified)...")
                cur.execute("TRUNCATE TABLE memories RESTART IDENTITY")

            # Check existing records to prevent exact duplicate insertions
            cur.execute("SELECT category, content FROM memories")
            existing = {(r["category"], r["content"]) for r in cur.fetchall()}

            inserted_count = 0
            skipped_count = 0

            for rec in records:
                key = (rec["category"], rec["content"])
                if key in existing:
                    skipped_count += 1
                    continue

                cur.execute(
                    """
                    INSERT INTO memories (category, content, created_at, updated_at)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        rec["category"],
                        rec["content"],
                        rec.get("created_at"),
                        rec.get("updated_at"),
                    ),
                )
                inserted_count += 1

            conn.commit()

            # Verify total count
            cur.execute("SELECT COUNT(*) AS total FROM memories")
            total = cur.fetchone()["total"]

            print("\nMigration Completed Successfully:")
            print(f"  - Source records read from SQLite: {len(records)}")
            print(f"  - Records inserted into PostgreSQL: {inserted_count}")
            print(f"  - Duplicate records skipped: {skipped_count}")
            print(f"  - Total records currently in PostgreSQL: {total}")
    finally:
        conn.close()


def main():
    args = parse_args()
    print("==================================================")
    print("      JARVIS DATABASE MIGRATION UTILITY          ")
    print("==================================================")
    print(f"Source SQLite path: {SQLITE_PATH}")

    records = load_sqlite_memories()
    print(f"Found {len(records)} existing memory records in SQLite.")

    if args.dry_run:
        print("\n[DRY RUN MODE] - No database writes will occur.")
        for r in records[:5]:
            print(
                f"  * [{r['category']}] (ID {r['id']}): {r['content'][:60]}... ({r['created_at']})"
            )
        if len(records) > 5:
            print(f"  ... and {len(records) - 5} more records.")
        print(
            "\nDry run completed successfully. To execute live migration, pass --database-url."
        )
        return

    if not args.database_url:
        print("\n[!] Error: No PostgreSQL URL provided.")
        print(
            "Please set the DATABASE_URL environment variable or provide --database-url."
        )
        sys.exit(1)

    migrate_to_postgres(args.database_url, records, reset_target=args.reset_target)


if __name__ == "__main__":
    main()

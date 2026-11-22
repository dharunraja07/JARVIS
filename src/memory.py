"""
JARVIS Memory Database Engine & Abstraction Layer
Supports dual storage engines:
1. Local Embedded SQLite (default for offline & desktop: src/database/jarvis_memory.db)
2. Cloud Managed PostgreSQL (when DATABASE_URL is set e.g. Neon, Supabase, Render PostgreSQL)
Zero data loss, automatic schema initialization, and unified query execution.
"""

import logging
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("jarvis.memory_db")

BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_PATH = DATABASE_DIR / "jarvis_memory.db"


def get_database_url() -> str | None:
    """Return sanitized DATABASE_URL if configured for PostgreSQL."""
    url = os.getenv("DATABASE_URL", "").strip()
    if url.startswith("postgres://") or url.startswith("postgresql://"):
        return url
    return None


def is_postgres_active() -> bool:
    """Check if PostgreSQL engine is enabled via DATABASE_URL."""
    return get_database_url() is not None


# ==========================================
# SQLITE ENGINE
# ==========================================
@contextmanager
def get_sqlite_connection():
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ==========================================
# POSTGRESQL ENGINE
# ==========================================
@contextmanager
def get_postgres_connection():
    import psycopg
    from psycopg.rows import dict_row

    db_url = get_database_url()
    if not db_url:
        raise ValueError("DATABASE_URL is not configured for PostgreSQL connection.")

    # Fix legacy postgres:// prefix if necessary for newer drivers
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    conn = psycopg.connect(db_url, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Backward-compatible connection context manager
@contextmanager
def get_connection():
    if is_postgres_active():
        with get_postgres_connection() as conn:
            yield conn
    else:
        with get_sqlite_connection() as conn:
            yield conn


# ==========================================
# SCHEMA INITIALIZATION
# ==========================================
def init_db():
    """Initialize memories table in active database (SQLite or PostgreSQL)."""
    if is_postgres_active():
        try:
            with get_postgres_connection() as conn, conn.cursor() as cur:
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
            logger.info("Initialized Cloud PostgreSQL Memory Database.")
        except Exception as e:
            logger.error("Failed to initialize PostgreSQL memories table: %s", e)
            raise
    else:
        DATABASE_DIR.mkdir(parents=True, exist_ok=True)
        with get_sqlite_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_memories_category ON memories (category);"
            )
        logger.info("Initialized Local SQLite Memory Database at %s", DATABASE_PATH)


def _serialize_row(row: dict | sqlite3.Row) -> dict:
    """Format row dictionary with ISO date strings for JSON compatibility."""
    item = dict(row)
    for key in ("created_at", "updated_at"):
        val = item.get(key)
        if isinstance(val, datetime):
            item[key] = val.isoformat()
    return item


# ==========================================
# UNIFIED REPOSITORY OPERATIONS
# ==========================================
def insert_memory(category: str, content: str) -> int:
    """Insert a memory record into the active database and return ID."""
    init_db()
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                    INSERT INTO memories (category, content)
                    VALUES (%s, %s)
                    RETURNING id;
                    """,
                (category, content),
            )
            res = cur.fetchone()
            return res["id"] if isinstance(res, dict) else res[0]
    else:
        with get_sqlite_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO memories (category, content)
                VALUES (?, ?)
                """,
                (category, content),
            )
            return cursor.lastrowid


def select_all_memories() -> list[dict]:
    """Retrieve all memories ordered by updated_at descending."""
    init_db()
    query = """
        SELECT id, category, content, created_at, updated_at
        FROM memories
        ORDER BY updated_at DESC, id DESC
    """
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()
            return [_serialize_row(r) for r in rows]
    else:
        with get_sqlite_connection() as conn:
            rows = conn.execute(query).fetchall()
            return [_serialize_row(r) for r in rows]


def select_memory_by_id(memory_id: int) -> dict | None:
    """Retrieve a single memory record by primary ID."""
    init_db()
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                    SELECT id, category, content, created_at, updated_at
                    FROM memories
                    WHERE id = %s
                    """,
                (memory_id,),
            )
            row = cur.fetchone()
            return _serialize_row(row) if row else None
    else:
        with get_sqlite_connection() as conn:
            row = conn.execute(
                """
                SELECT id, category, content, created_at, updated_at
                FROM memories
                WHERE id = ?
                """,
                (memory_id,),
            ).fetchone()
            return _serialize_row(row) if row else None


def search_memory_records(keyword: str) -> list[dict]:
    """Search memories matching keyword in category or content."""
    init_db()
    search_term = f"%{keyword}%"
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                    SELECT id, category, content, created_at, updated_at
                    FROM memories
                    WHERE category ILIKE %s OR content ILIKE %s
                    ORDER BY updated_at DESC, id DESC
                    """,
                (search_term, search_term),
            )
            rows = cur.fetchall()
            return [_serialize_row(r) for r in rows]
    else:
        with get_sqlite_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, category, content, created_at, updated_at
                FROM memories
                WHERE category LIKE ? OR content LIKE ?
                ORDER BY updated_at DESC, id DESC
                """,
                (search_term, search_term),
            ).fetchall()
            return [_serialize_row(r) for r in rows]


def update_memory_record(
    memory_id: int, content: str, category: str | None = None
) -> bool:
    """Update content and optionally category of a memory."""
    init_db()
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            if category is not None:
                cur.execute(
                    """
                        UPDATE memories
                        SET category = %s,
                            content = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                        """,
                    (category, content, memory_id),
                )
            else:
                cur.execute(
                    """
                        UPDATE memories
                        SET content = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                        """,
                    (content, memory_id),
                )
            return cur.rowcount > 0
    else:
        with get_sqlite_connection() as conn:
            if category is not None:
                cursor = conn.execute(
                    """
                    UPDATE memories
                    SET category = ?,
                        content = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (category, content, memory_id),
                )
            else:
                cursor = conn.execute(
                    """
                    UPDATE memories
                    SET content = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (content, memory_id),
                )
            return cursor.rowcount > 0


def delete_memory_record(memory_id: int) -> bool:
    """Delete memory by ID and return boolean indicating success."""
    init_db()
    if is_postgres_active():
        with get_postgres_connection() as conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM memories WHERE id = %s",
                (memory_id,),
            )
            return cur.rowcount > 0
    else:
        with get_sqlite_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM memories WHERE id = ?",
                (memory_id,),
            )
            return cursor.rowcount > 0


if __name__ == "__main__":
    init_db()
    engine = "PostgreSQL" if is_postgres_active() else "SQLite"
    print(f"Memory database engine initialized successfully: {engine}")

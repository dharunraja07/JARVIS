
from memory import get_connection, init_db


# ==========================================
# SAVE MEMORY
# ==========================================

def save_memory(category: str, content: str) -> int:

    category = category.strip()
    content = content.strip()

    if not category or not content:
        raise ValueError("Category and content cannot be empty.")

    init_db()

    with get_connection() as connection:

        cursor = connection.execute(
            """
            INSERT INTO memories (category, content)
            VALUES (?, ?)
            """,
            (category, content),
        )

        memory_id = cursor.lastrowid

    print(f"Memory saved successfully. ID: {memory_id}")

    return memory_id


# ==========================================
# RETRIEVE ALL MEMORIES
# ==========================================

def get_all_memories():

   

    with get_connection() as connection:

        rows = connection.execute(
            """
            SELECT id, category, content, created_at, updated_at
            FROM memories
            ORDER BY updated_at DESC, id DESC
            """
        ).fetchall()

    return [dict(row) for row in rows]


# ==========================================
# RETRIEVE MEMORY BY ID
# ==========================================

def get_memory_by_id(memory_id: int):

    with get_connection() as connection:

        row = connection.execute(
            """
            SELECT id, category, content, created_at, updated_at
            FROM memories
            WHERE id = ?
            """,
            (memory_id,),
        ).fetchone()

    return dict(row) if row else None


# ==========================================
# SEARCH MEMORIES
# ==========================================

def search_memories(keyword: str):

    keyword = keyword.strip()

    if not keyword:
        return []

    search_term = f"%{keyword}%"

    with get_connection() as connection:

        rows = connection.execute(
            """
            SELECT id, category, content, created_at, updated_at
            FROM memories
            WHERE category LIKE ? OR content LIKE ?
            ORDER BY updated_at DESC, id DESC
            """,
            (search_term, search_term),
        ).fetchall()

    return [dict(row) for row in rows]


# ==========================================
# UPDATE MEMORY
# ==========================================

def update_memory(
    memory_id: int,
    content: str,
    category: str | None = None,
) -> bool:

    content = content.strip()

    if not content:
        raise ValueError("Memory content cannot be empty.")

    with get_connection() as connection:

        if category is not None:

            category = category.strip()

            if not category:
                raise ValueError("Category cannot be empty.")

            cursor = connection.execute(
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

            cursor = connection.execute(
                """
                UPDATE memories
                SET content = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (content, memory_id),
            )

        updated = cursor.rowcount > 0

    if updated:
        print(f"Memory {memory_id} updated successfully.")
    else:
        print(f"Memory {memory_id} was not found.")

    return updated


# ==========================================
# DELETE MEMORY
# ==========================================

def delete_memory(memory_id: int) -> bool:

    with get_connection() as connection:

        cursor = connection.execute(
            """
            DELETE FROM memories
            WHERE id = ?
            """,
            (memory_id,),
        )

        deleted = cursor.rowcount > 0

    if deleted:
        print(f"Memory {memory_id} deleted successfully.")
    else:
        print(f"Memory {memory_id} was not found.")

    return deleted


# ==========================================
# TEST ALL MEMORY OPERATIONS
# ==========================================

if __name__ == "__main__":

    print("\n===== JARVIS MEMORY SYSTEM TEST =====\n")

    # 1. Save
    test_id = save_memory(
        "Development",
        "JARVIS is being developed using Python and LiveKit.",
    )

    # 2. Retrieve
    print("\n--- All Memories ---")

    for memory in get_all_memories():
        print(memory)

    # 3. Search
    print("\n--- Search Results ---")

    results = search_memories("LiveKit")

    for memory in results:
        print(memory)

    # 4. Update
    print("\n--- Update Test ---")

    update_memory(
        test_id,
        "JARVIS uses Python, LiveKit and SQLite for persistent memory.",
    )

    print(get_memory_by_id(test_id))

    # 5. Delete
    print("\n--- Delete Test ---")

    delete_memory(test_id)

    print("\n--- Verification ---")
    print("Remaining test record:", get_memory_by_id(test_id))

    print("\n===== TEST COMPLETED =====")

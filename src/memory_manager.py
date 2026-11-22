"""
JARVIS Memory Manager Module
Exposes high-level business logic for saving, querying, updating, and deleting memories.
Delegates to the database abstraction layer (memory.py) supporting SQLite and PostgreSQL.
"""

from memory import (
    delete_memory_record,
    insert_memory,
    search_memory_records,
    select_all_memories,
    select_memory_by_id,
    update_memory_record,
)


# ==========================================
# SAVE MEMORY
# ==========================================
def save_memory(category: str, content: str) -> int:
    category = category.strip()
    content = content.strip()

    if not category or not content:
        raise ValueError("Category and content cannot be empty.")

    memory_id = insert_memory(category, content)
    print(f"Memory saved successfully. ID: {memory_id}")
    return memory_id


# ==========================================
# RETRIEVE ALL MEMORIES
# ==========================================
def get_all_memories() -> list[dict]:
    return select_all_memories()


# ==========================================
# RETRIEVE MEMORY BY ID
# ==========================================
def get_memory_by_id(memory_id: int) -> dict | None:
    return select_memory_by_id(memory_id)


# ==========================================
# SEARCH MEMORIES
# ==========================================
def search_memories(keyword: str) -> list[dict]:
    keyword = keyword.strip()
    if not keyword:
        return []
    return search_memory_records(keyword)


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

    if category is not None:
        category = category.strip()
        if not category:
            raise ValueError("Category cannot be empty.")

    updated = update_memory_record(memory_id, content, category)
    if updated:
        print(f"Memory {memory_id} updated successfully.")
    else:
        print(f"Memory {memory_id} was not found.")
    return updated


# ==========================================
# DELETE MEMORY
# ==========================================
def delete_memory(memory_id: int) -> bool:
    deleted = delete_memory_record(memory_id)
    if deleted:
        print(f"Memory {memory_id} deleted successfully.")
    else:
        print(f"Memory {memory_id} was not found.")
    return deleted


if __name__ == "__main__":
    print("\n===== JARVIS MEMORY SYSTEM TEST =====\n")
    test_id = save_memory(
        "Development",
        "JARVIS is being developed using Python and LiveKit.",
    )
    print("\n--- All Memories ---")
    for memory in get_all_memories():
        print(memory)

    print("\n--- Search Results ---")
    for memory in search_memories("LiveKit"):
        print(memory)

    update_memory(
        test_id,
        "JARVIS uses Python, LiveKit and PostgreSQL/SQLite persistent memory.",
    )
    print("Updated memory:", get_memory_by_id(test_id))
    delete_memory(test_id)
    print("Post-delete check:", get_memory_by_id(test_id))
    print("\n===== TEST COMPLETED =====")

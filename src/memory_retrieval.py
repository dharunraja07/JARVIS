
import re

from memory_manager import get_all_memories


# ==========================================
# TEXT NORMALIZATION
# ==========================================

def tokenize(text: str) -> set[str]:

    return set(re.findall(r"[a-z0-9]+", text.lower()))


# ==========================================
# QUERY EXPANSION
# ==========================================

SYNONYMS = {
    "programming": {"python", "java", "coding", "software"},
    "technologies": {"languages", "frameworks", "tools"},
    "technology": {"languages", "frameworks", "tools"},
    "learning": {"learn", "studying", "study"},
    "projects": {"project", "building", "developing"},
    "career": {"job", "placement", "profession"},
    "goals": {"goal", "ambition", "target"},
}


STOP_WORDS = {
    "what", "when", "where", "who", "why",
    "how", "is", "am", "are", "the", "a",
    "an", "my", "me", "i", "you", "do",
    "did", "does", "can", "could", "would",
    "tell", "about", "please", "jarvis",
    "and", "in", "of", "to", "for",
}


# ==========================================
# MEMORY RETRIEVAL
# ==========================================

def retrieve_relevant_memories(
    query: str,
    limit: int = 5,
) -> list[dict]:

    if not query or not query.strip():
        return []

    if limit < 1:
        return []

    query_words = tokenize(query)

    keywords = query_words - STOP_WORDS

    expanded_keywords = set(keywords)

    for keyword in keywords:
        expanded_keywords.update(
            SYNONYMS.get(keyword, set())
        )

    memories = get_all_memories()

    ranked_memories = []

    for memory in memories:

        content_words = tokenize(memory["content"])
        category_words = tokenize(memory["category"])

        score = 0

        # Exact phrase matching
        normalized_query = " ".join(
            re.findall(r"[a-z0-9]+", query.lower())
        )

        normalized_content = " ".join(
            re.findall(r"[a-z0-9]+", memory["content"].lower())
        )

        if normalized_query in normalized_content:
            score += 10

        # Match original keywords
        for keyword in keywords:

            if keyword in content_words:
                score += 3

            if keyword in category_words:
                score += 4

        # Match expanded keywords
        for keyword in expanded_keywords - keywords:

            if keyword in content_words:
                score += 2

            if keyword in category_words:
                score += 3

        if score > 0:

            ranked_memories.append({
                **memory,
                "relevance_score": score,
            })

    # Highest relevance first
    ranked_memories.sort(
        key=lambda item: (
            -item["relevance_score"],
            -item["id"],
        )
    )

    return ranked_memories[:limit]


# ==========================================
# BUILD AI CONTEXT
# ==========================================

def build_memory_context(query: str) -> str:

    memories = retrieve_relevant_memories(query)

    if not memories:
        return ""

    context = [
        "Relevant information remembered about the user:"
    ]

    for memory in memories:

        context.append(
            f"- [{memory['category']}] {memory['content']}"
        )

    return "\n".join(context)


# ==========================================
# TEST RETRIEVAL
# ==========================================

if __name__ == "__main__":

    print("\n===== JARVIS INTELLIGENT MEMORY TEST =====")

    queries = [
        "What programming technologies am I learning?",
        "Tell me about my projects",
        "What are my career goals?",
        "Which programming language am I studying?",
    ]

    for query in queries:

        print(f"\nQuery: {query}")

        results = retrieve_relevant_memories(query)

        if results:

            for memory in results:

                print(
                    f"Match: [{memory['category']}] "
                    f"{memory['content']}"
                )

                print(
                    f"Relevance Score: "
                    f"{memory['relevance_score']}"
                )

        else:
            print("No relevant memories found.")

        print("\nAI Context:")
        print(build_memory_context(query))

    print("\n===== TEST COMPLETED =====")

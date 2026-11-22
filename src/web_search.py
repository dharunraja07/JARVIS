import logging

from ddgs import DDGS

logger = logging.getLogger("jarvis.web_search")


# Try different free search providers in sequence.
SEARCH_BACKENDS = [
    "bing",
    "brave",
    "duckduckgo",
    "google",
    "yahoo",
    "mojeek",
]


def search_web(
    query: str,
    max_results: int = 5,
) -> list[dict]:

    query = query.strip()

    if not query:
        return []

    if not 1 <= max_results <= 10:
        raise ValueError("max_results must be between 1 and 10.")

    for backend in SEARCH_BACKENDS:
        try:
            logger.info(
                "Trying search backend: %s",
                backend,
            )

            with DDGS(timeout=10) as ddgs:
                results = ddgs.text(
                    query,
                    region="in-en",
                    safesearch="moderate",
                    max_results=max_results,
                    backend=backend,
                )

            if results:
                formatted_results = []

                for result in results:
                    title = result.get("title", "")
                    url = result.get("href", "")
                    snippet = result.get("body", "")

                    if not title or not url:
                        continue

                    formatted_results.append(
                        {
                            "title": title,
                            "url": url,
                            "snippet": snippet,
                        }
                    )

                if formatted_results:
                    logger.info(
                        "Search succeeded using %s. Results: %d",
                        backend,
                        len(formatted_results),
                    )

                    return formatted_results

            logger.warning(
                "Backend %s returned no usable results.",
                backend,
            )

        except Exception:
            logger.exception(
                "Search backend %s failed.",
                backend,
            )

    logger.error(
        "All search backends failed for query: %s",
        query,
    )

    return []


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    query = input("What should JARVIS search for? ")

    results = search_web(query)

    print("\n===== JARVIS WEB SEARCH =====\n")

    if not results:
        print("No results found. All search providers were unsuccessful.")

    for index, result in enumerate(
        results,
        start=1,
    ):
        print(f"{index}. {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Description: {result['snippet']}")
        print()

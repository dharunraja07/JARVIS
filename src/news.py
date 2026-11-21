
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone


GOOGLE_NEWS_BASE = "https://news.google.com/rss"

# BBC feeds for specific categories
BBC_FEEDS = {
    "technology": "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "world": "https://feeds.bbci.co.uk/news/world/rss.xml",
    "business": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "india": "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    "science": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
}


def fetch_feed(url: str) -> list[dict]:
    """Fetch and parse an RSS feed."""

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "JARVIS-Personal-Assistant/1.0"
        }
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    items = root.findall(".//item")

    news_items = []

    for item in items:
        title = item.findtext("title", default="").strip()
        link = item.findtext("link", default="").strip()
        description = item.findtext("description", default="").strip()
        pub_date = item.findtext("pubDate", default="").strip()

        source_element = item.find("source")
        source = (
            source_element.text.strip()
            if source_element is not None and source_element.text
            else "News source"
        )

        try:
            published = parsedate_to_datetime(pub_date)
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc).isoformat()
        except (ValueError, TypeError):
            published = pub_date or "Publication date unavailable"

        if title and link:
            news_items.append({
                "title": title,
                "source": source,
                "link": link,
                "published": published,
                "description": description,
            })

    return news_items


def get_news(category: str = "general", max_results: int = 5) -> list[dict]:
    """Get news by category or search query."""

    category = category.strip().lower()

    if not 1 <= max_results <= 10:
        raise ValueError("max_results must be between 1 and 10.")

    if category in BBC_FEEDS:
        url = BBC_FEEDS[category]

    elif category in ("general", "india news"):
        url = (
            f"{GOOGLE_NEWS_BASE}?"
            "hl=en-IN&gl=IN&ceid=IN:en"
        )

    else:
        params = urllib.parse.urlencode({
            "q": f"{category} when:7d",
            "hl": "en-IN",
            "gl": "IN",
            "ceid": "IN:en",
        })
        url = f"{GOOGLE_NEWS_BASE}/search?{params}"

    results = fetch_feed(url)

    return results[:max_results]


def format_news(category: str = "general", max_results: int = 5) -> str:
    """Format news headlines for JARVIS."""

    try:
        results = get_news(category, max_results)

        if not results:
            return f"No news articles found for {category}."

        lines = [
            f"Latest News: {category.title()}",
            "--------------------------------",
        ]

        for index, article in enumerate(results, start=1):
            lines.append(
                f"{index}. {article['title']}\n"
                f"   Source: {article['source']}\n"
                f"   Published: {article['published']}\n"
                f"   Link: {article['link']}"
            )

        lines.append(
            "\nThese are retrieved headlines. "
            "Open the article links for full reporting."
        )

        return "\n\n".join(lines)

    except Exception as error:
        return f"News service error: {error}"


if __name__ == "__main__":
    print("JARVIS News Intelligence Test")
    print("-----------------------------")

    category = input(
        "Enter category (technology, india, world, business, "
        "science, AI, or general): "
    ).strip()

    print("\n" + format_news(category, 5))

import json
import urllib.request
from urllib.error import HTTPError, URLError


def get_exchange_rate(from_currency: str, to_currency: str) -> dict:
    """Fetch the latest available reference exchange rate."""

    source = from_currency.strip().upper()
    target = to_currency.strip().upper()

    if len(source) != 3 or len(target) != 3:
        raise ValueError("Currency codes must contain 3 letters, e.g. USD, INR.")

    if not source.isalpha() or not target.isalpha():
        raise ValueError("Invalid currency code.")

    if source == target:
        return {
            "base": source,
            "quote": target,
            "rate": 1.0,
            "date": "Same currency",
        }

    url = (
        f"https://api.frankfurter.dev/v2/rate/"
        f"{source}/{target}"
    )

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "JARVIS-Personal-Assistant/1.0"}
    )

    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))

    return {
        "base": data["base"],
        "quote": data["quote"],
        "rate": float(data["rate"]),
        "date": data["date"],
    }


def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str
) -> dict:
    """Convert an amount using the latest available reference rate."""

    if amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    exchange = get_exchange_rate(from_currency, to_currency)

    converted_amount = amount * exchange["rate"]

    return {
        "amount": amount,
        "from": exchange["base"],
        "to": exchange["quote"],
        "exchange_rate": exchange["rate"],
        "converted_amount": round(converted_amount, 2),
        "rate_date": exchange["date"],
    }


def format_conversion(
    amount: float,
    from_currency: str,
    to_currency: str
) -> str:
    """Create a readable currency conversion report."""

    try:
        result = convert_currency(
            amount,
            from_currency,
            to_currency
        )

        return (
            f"Currency Conversion\n"
            f"-------------------\n"
            f"Amount: {result['amount']:,.2f} {result['from']}\n"
            f"Exchange Rate: 1 {result['from']} = "
            f"{result['exchange_rate']:.6f} {result['to']}\n"
            f"Converted Amount: "
            f"{result['converted_amount']:,.2f} {result['to']}\n"
            f"Rate Date: {result['rate_date']}\n"
            f"Source: Frankfurter reference exchange rates"
        )

    except (ValueError, HTTPError, URLError, TimeoutError, KeyError) as error:
        return f"Currency conversion error: {error}"

    except Exception as error:
        return f"Unexpected error: {error}"


if __name__ == "__main__":
    print("JARVIS Currency Conversion Test")
    print("--------------------------------")

    try:
        amount = float(input("Enter amount: "))
        from_currency = input("From currency (e.g. USD): ")
        to_currency = input("To currency (e.g. INR): ")

        print(
            "\n" + format_conversion(
                amount,
                from_currency,
                to_currency
            )
        )

    except ValueError as error:
        print(f"Input error: {error}")
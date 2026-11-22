from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def get_time_info(timezone_name: str = "") -> dict:
    """
    Get the current date and time.
    If timezone_name is empty, use the computer's local timezone.
    Otherwise, use the requested IANA timezone.
    """

    if timezone_name and timezone_name.strip():
        try:
            tz = ZoneInfo(timezone_name.strip())
        except ZoneInfoNotFoundError:
            raise ValueError(
                f"Unknown timezone: {timezone_name}. "
                "Use an IANA timezone such as Asia/Kolkata or Europe/London."
            ) from None
    else:
        tz = datetime.now().astimezone().tzinfo

    now = datetime.now(tz)

    return {
        "date": now.strftime("%d %B %Y"),
        "time": now.strftime("%I:%M:%S %p"),
        "day": now.strftime("%A"),
        "timezone": str(now.tzinfo),
        "utc_offset": now.strftime("%z"),
        "iso_datetime": now.isoformat(),
    }


def get_time_report(timezone_name: str = "") -> str:
    """Return a readable date and time report."""

    try:
        info = get_time_info(timezone_name)

        return (
            f"Current Date: {info['date']}\n"
            f"Current Time: {info['time']}\n"
            f"Day: {info['day']}\n"
            f"Timezone: {info['timezone']}\n"
            f"UTC Offset: {info['utc_offset']}"
        )

    except ValueError as error:
        return f"Time service error: {error}"


if __name__ == "__main__":
    print("JARVIS Time Intelligence Test")
    print("-----------------------------")

    timezone_name = input("Enter timezone (press Enter for your local time): ").strip()

    print("\n" + get_time_report(timezone_name))

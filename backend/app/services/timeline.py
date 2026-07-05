"""Normalize and sort incident timeline timestamps."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from app.models.analysis import TimelineEvent

_UNKNOWN_TIME = frozenset({"—", "-", "unknown", "n/a", "na", ""})
_DISPLAY_FORMAT = "%Y-%m-%d %H:%M:%S"

# syslog style: Jul 03 18:41:12
_SYSLOG_RE = re.compile(
    r"^(?P<mon>[A-Za-z]{3})\s+(?P<day>\d{1,2})\s+(?P<time>\d{2}:\d{2}:\d{2})$"
)


def normalize_timeline(events: list[TimelineEvent]) -> list[TimelineEvent]:
    """Parse heterogeneous log timestamps into a unified display format and sort."""
    enriched: list[tuple[datetime | None, int, TimelineEvent]] = []

    for index, event in enumerate(events):
        parsed = _parse_timestamp(event.time)
        display = (
            parsed.astimezone(timezone.utc).strftime(_DISPLAY_FORMAT)
            if parsed
            else event.time.strip()
        )
        enriched.append(
            (
                parsed,
                index,
                TimelineEvent(
                    time=display,
                    title=event.title,
                    source=event.source,
                    detail=event.detail,
                ),
            )
        )

    enriched.sort(
        key=lambda item: (
            item[0] is None,
            item[0] or datetime.max.replace(tzinfo=timezone.utc),
            item[1],
        )
    )
    return [item[2] for item in enriched]


def _parse_timestamp(raw: str) -> datetime | None:
    text = raw.strip()
    if text.lower() in _UNKNOWN_TIME:
        return None

    if text.endswith("Z"):
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            pass

    try:
        parsed = datetime.fromisoformat(text)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except ValueError:
        pass

    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%b %d %Y %H:%M:%S",
        "%b %d %H:%M:%S",
    ):
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=datetime.now(timezone.utc).year)
            return parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            continue

    syslog_match = _SYSLOG_RE.match(text)
    if syslog_match:
        try:
            candidate = (
                f"{syslog_match.group('mon')} {syslog_match.group('day')} "
                f"{datetime.now(timezone.utc).year} {syslog_match.group('time')}"
            )
            parsed = datetime.strptime(candidate, "%b %d %Y %H:%M:%S")
            return parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    time_only = re.match(r"^(\d{2}:\d{2})(:\d{2})?$", text)
    if time_only:
        return None

    return None

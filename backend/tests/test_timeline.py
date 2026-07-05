"""Tests for timeline timestamp normalization."""

from app.models.analysis import TimelineEvent
from app.services.timeline import normalize_timeline


def test_normalize_timeline_unifies_formats_and_sorts() -> None:
    events = [
        TimelineEvent(
            time="Jul 03 18:41:12",
            title="OOM Killer terminated backend",
            source="journal",
        ),
        TimelineEvent(
            time="2026-07-03T18:43:51Z",
            title="PM2 restarted backend",
            source="pm2",
        ),
        TimelineEvent(
            time="2026/07/03 18:44:14",
            title="Nginx upstream failed",
            source="nginx",
        ),
    ]

    normalized = normalize_timeline(events)

    assert len(normalized) == 3
    assert all(" " in event.time and "T" not in event.time for event in normalized)
    assert normalized[0].title == "OOM Killer terminated backend"
    assert normalized[-1].title == "Nginx upstream failed"


def test_normalize_timeline_preserves_unknown_times() -> None:
    events = [
        TimelineEvent(time="—", title="Unknown-time event", source="docker"),
    ]

    normalized = normalize_timeline(events)

    assert normalized[0].time == "—"

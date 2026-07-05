"""Tests for LLM JSON parsing."""

import pytest

from app.models.analysis import AnalysisResponse
from app.services.llm_parser import ParseError, parse_analysis_response


def test_parse_analysis_response_from_dict() -> None:
    payload = {
        "health_score": 82,
        "severity": "Medium",
        "summary": "Backend memory pressure is causing nginx 502 errors.",
        "timeline": [
            {
                "time": "14:28",
                "title": "OOM Killer terminated backend",
                "source": "journal",
            },
            {
                "time": "14:29",
                "title": "Nginx upstream failed",
                "source": "nginx",
            },
        ],
        "timeline_summary": "Overall outage",
        "confidence": "High",
        "confidence_reason": "Journal, PM2, and nginx logs corroborate the failure chain.",
        "issues": [
            {
                "title": "nginx returning 502",
                "severity": "High",
                "source": "nginx",
                "detail": "Upstream unavailable",
            }
        ],
        "recommendations": [
            {
                "action": "Restart PM2 process",
                "command": "pm2 restart all",
            },
            "Increase Node.js heap size",
        ],
    }

    result = parse_analysis_response(payload)

    assert isinstance(result, AnalysisResponse)
    assert result.health_score == 82
    assert result.severity == "Medium"
    assert len(result.timeline) == 2
    assert result.timeline[0].title == "OOM Killer terminated backend"
    assert result.timeline_summary == "Overall outage"
    assert result.confidence == "High"
    assert len(result.issues) == 1
    assert result.issues[0].title == "nginx returning 502"
    assert len(result.recommendations) == 2
    assert result.recommendations[0].command == "pm2 restart all"


def test_parse_analysis_response_from_fenced_json() -> None:
    raw = """```json
{
  "health_score": 55,
  "severity": "high",
  "summary": "Disk nearly full.",
        "issues": ["Disk usage at 91%"],
        "recommendations": ["Clean old logs"]
}
```"""

    result = parse_analysis_response(raw)

    assert result.health_score == 55
    assert result.severity == "High"
    assert result.issues[0].title == "Disk usage at 91%"


def test_parse_recommendations_accepts_strings_and_objects() -> None:
    payload = {
        "health_score": 70,
        "severity": "Medium",
        "summary": "Test",
        "issues": [],
        "recommendations": [
            {"action": "Restart nginx", "command": "systemctl restart nginx"},
            "Check disk space",
        ],
    }

    result = parse_analysis_response(payload)

    assert len(result.recommendations) == 2
    assert result.recommendations[0].command == "systemctl restart nginx"
    assert result.recommendations[1].action == "Check disk space"

    with pytest.raises(ParseError, match="health_score"):
        parse_analysis_response(
            {
                "health_score": 150,
                "severity": "Low",
                "summary": "ok",
                "issues": [],
                "recommendations": [],
            }
        )

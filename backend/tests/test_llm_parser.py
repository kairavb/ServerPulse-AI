"""Tests for LLM JSON parsing."""

import pytest

from app.models.analysis import AnalysisResponse
from app.services.llm_parser import ParseError, parse_analysis_response


def test_parse_analysis_response_from_dict() -> None:
    payload = {
        "health_score": 82,
        "severity": "Medium",
        "summary": "Backend memory pressure is causing nginx 502 errors.",
        "issues": [
            {
                "title": "nginx returning 502",
                "severity": "High",
                "source": "nginx",
                "detail": "Upstream unavailable",
            }
        ],
        "recommendations": ["Restart PM2 process", "Increase Node heap size"],
    }

    result = parse_analysis_response(payload)

    assert isinstance(result, AnalysisResponse)
    assert result.health_score == 82
    assert result.severity == "Medium"
    assert len(result.issues) == 1
    assert result.issues[0].title == "nginx returning 502"


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


def test_parse_analysis_response_rejects_invalid_score() -> None:
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

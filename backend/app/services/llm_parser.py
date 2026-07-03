"""Parse and normalize structured JSON from RocketRide / LLM responses."""

from __future__ import annotations

import json
import re
from typing import Any

from app.models.analysis import AnalysisResponse, Issue

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


class ParseError(ValueError):
    """Raised when the model output cannot be mapped to AnalysisResponse."""


def parse_analysis_response(raw: Any) -> AnalysisResponse:
    """
    Convert LLM output into the API response model.

    Handles dict answers (expectJson=True), raw JSON strings, and fenced blocks.
    """
    payload = _coerce_payload(raw)
    return _map_payload(payload)


def _coerce_payload(raw: Any) -> dict[str, Any]:
    if isinstance(raw, dict):
        return raw

    if isinstance(raw, str):
        text = raw.strip()
        if not text:
            raise ParseError("LLM returned an empty response.")

        fence_match = _JSON_FENCE_RE.search(text)
        if fence_match:
            text = fence_match.group(1).strip()

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ParseError("LLM response is not valid JSON.") from exc

        if not isinstance(parsed, dict):
            raise ParseError("LLM JSON must be an object.")
        return parsed

    raise ParseError(f"Unexpected LLM response type: {type(raw).__name__}")


def _map_payload(payload: dict[str, Any]) -> AnalysisResponse:
    """Map flexible LLM keys onto the stable API schema."""
    health_score = _require_int(payload, "health_score", minimum=0, maximum=100)
    severity = _normalize_severity(payload.get("severity"))
    summary = _require_str(payload, "summary")
    limitations = _optional_str(payload.get("limitations"))
    if limitations:
        summary = f"{summary}\n\nAnalysis limitations: {limitations}"
    issues = _parse_issues(payload.get("issues", []))
    recommendations = _parse_string_list(payload.get("recommendations", []))

    return AnalysisResponse(
        health_score=health_score,
        severity=severity,
        summary=summary,
        issues=issues,
        recommendations=recommendations,
    )


def _parse_issues(raw_issues: Any) -> list[Issue]:
    if not isinstance(raw_issues, list):
        raise ParseError("'issues' must be a list.")

    issues: list[Issue] = []
    for index, item in enumerate(raw_issues):
        if isinstance(item, str):
            issues.append(Issue(title=item))
            continue

        if not isinstance(item, dict):
            raise ParseError(f"Issue at index {index} must be an object or string.")

        title = item.get("title") or item.get("name")
        if not title:
            raise ParseError(f"Issue at index {index} is missing a title.")

        issues.append(
            Issue(
                title=str(title),
                severity=_normalize_severity(item.get("severity", "Medium")),
                source=_optional_str(item.get("source")),
                detail=_optional_str(item.get("detail") or item.get("description")),
                evidence=_optional_str(item.get("evidence")),
            )
        )

    return issues


def _parse_string_list(raw: Any) -> list[str]:
    if not isinstance(raw, list):
        raise ParseError("'recommendations' must be a list.")
    return [str(item) for item in raw if str(item).strip()]


def _normalize_severity(value: Any) -> str:
    if value is None:
        return "Medium"

    normalized = str(value).strip().lower()
    mapping = {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "critical": "Critical",
    }
    if normalized not in mapping:
        raise ParseError(f"Invalid severity value: {value!r}")
    return mapping[normalized]


def _require_str(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ParseError(f"Missing or invalid '{key}' in LLM response.")
    return value.strip()


def _optional_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _require_int(
    payload: dict[str, Any],
    key: str,
    *,
    minimum: int,
    maximum: int,
) -> int:
    value = payload.get(key)
    if value is None and key == "health_score" and "healthScore" in payload:
        value = payload["healthScore"]

    try:
        number = int(value)
    except (TypeError, ValueError) as exc:
        raise ParseError(f"Missing or invalid '{key}' in LLM response.") from exc

    if number < minimum or number > maximum:
        raise ParseError(f"'{key}' must be between {minimum} and {maximum}.")
    return number

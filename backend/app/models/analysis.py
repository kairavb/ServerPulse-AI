"""Pydantic models for the /analyze API contract."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["Low", "Medium", "High", "Critical"]
Confidence = Literal["Low", "Medium", "High"]


class Issue(BaseModel):
    """A single problem detected in the uploaded server logs."""

    title: str
    severity: Severity = "Medium"
    source: str | None = None
    detail: str | None = None
    evidence: str | None = None


class TimelineEvent(BaseModel):
    """A chronological event extracted from the uploaded logs."""

    time: str
    title: str
    source: str | None = None
    detail: str | None = None


class Recommendation(BaseModel):
    """An actionable fix with an optional shell command hint."""

    action: str
    command: str | None = None


class RiskScores(BaseModel):
    """Per-dimension risk levels (0–100; higher = greater risk)."""

    availability: int = Field(ge=0, le=100)
    security: int = Field(ge=0, le=100)
    storage: int = Field(ge=0, le=100)
    memory: int = Field(ge=0, le=100)
    networking: int = Field(ge=0, le=100)


class AnalysisResponse(BaseModel):
    """Structured health report returned to the client."""

    health_score: int = Field(ge=0, le=100)
    severity: Severity
    summary: str
    issues: list[Issue]
    recommendations: list[Recommendation]
    timeline: list[TimelineEvent] = Field(default_factory=list)
    timeline_summary: str | None = None
    confidence: Confidence = "Medium"
    confidence_reason: str | None = None
    suggested_logs: list[str] = Field(default_factory=list)
    risk_scores: RiskScores | None = None
    root_cause: str | None = None
    impact: str | None = None
    uploaded_logs: list[str] = Field(default_factory=list)
    generated_at: datetime | None = None

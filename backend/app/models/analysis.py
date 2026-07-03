"""Pydantic models for the /analyze API contract."""

from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["Low", "Medium", "High", "Critical"]


class Issue(BaseModel):
    """A single problem detected in the uploaded server logs."""

    title: str
    severity: Severity = "Medium"
    source: str | None = None
    detail: str | None = None
    evidence: str | None = None


class AnalysisResponse(BaseModel):
    """Structured health report returned to the client."""

    health_score: int = Field(ge=0, le=100)
    severity: Severity
    summary: str
    issues: list[Issue]
    recommendations: list[str]

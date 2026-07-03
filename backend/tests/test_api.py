"""API route tests with mocked RocketRide execution."""

from io import BytesIO
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.analysis import AnalysisResponse, Issue


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("ROCKETRIDE_URI", "http://localhost:5565")
    monkeypatch.setenv("ROCKETRIDE_APIKEY", "test-key")
    return TestClient(app)


def test_analyze_returns_structured_report(client: TestClient) -> None:
    mock_result = AnalysisResponse(
        health_score=82,
        severity="Medium",
        summary="Memory exhaustion is causing upstream failures.",
        issues=[
            Issue(
                title="nginx returning 502",
                severity="High",
                source="nginx",
            )
        ],
        recommendations=["Restart the PM2 process"],
    )

    with patch(
        "app.routes.analyze.run_analysis",
        new=AsyncMock(return_value=mock_result),
    ):
        response = client.post(
            "/analyze",
            files=[("files", ("nginx-error.log", BytesIO(b"502 error"), "text/plain"))],
        )

    assert response.status_code == 200
    body = response.json()
    assert body["health_score"] == 82
    assert body["severity"] == "Medium"
    assert body["issues"][0]["title"] == "nginx returning 502"


def test_analyze_rejects_unsupported_file(client: TestClient) -> None:
    response = client.post(
        "/analyze",
        files=[("files", ("random.log", BytesIO(b"data"), "text/plain"))],
    )

    assert response.status_code == 400
    assert "Unsupported file" in response.json()["detail"]

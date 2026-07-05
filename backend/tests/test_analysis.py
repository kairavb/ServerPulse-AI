"""Tests for RocketRide pipeline lifecycle in analysis service."""

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.analysis import _start_pipeline


@pytest.mark.asyncio
async def test_start_pipeline_reuses_existing_when_already_running() -> None:
    client = MagicMock()
    client.use = AsyncMock(
        side_effect=[
            RuntimeError("Pipeline is already running."),
            {"token": "existing-token-123"},
        ]
    )

    token = await _start_pipeline(client, Path("/fake/serverpulse.pipe"))

    assert token == "existing-token-123"
    assert client.use.await_count == 2
    client.use.assert_any_await(filepath="/fake/serverpulse.pipe", use_existing=True)


@pytest.mark.asyncio
async def test_start_pipeline_raises_other_runtime_errors() -> None:
    client = MagicMock()
    client.use = AsyncMock(side_effect=RuntimeError("Connection refused"))

    with pytest.raises(RuntimeError, match="Connection refused"):
        await _start_pipeline(client, Path("/fake/serverpulse.pipe"))

    assert client.use.await_count == 1

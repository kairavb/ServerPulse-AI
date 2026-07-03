"""Tests for log ingest and prompt building."""

from io import BytesIO

import pytest
from fastapi import UploadFile

from app.services.ingest import (
    IngestError,
    build_analysis_prompt,
    read_uploaded_logs,
)


def _upload(name: str, content: bytes) -> UploadFile:
    return UploadFile(filename=name, file=BytesIO(content))


@pytest.mark.asyncio
async def test_read_uploaded_logs_accepts_supported_files() -> None:
    files = [
        _upload("nginx-error.log", b"502 Bad Gateway"),
        _upload("free.txt", b"Mem: 1000"),
    ]

    logs = await read_uploaded_logs(files, max_files=10, max_total_bytes=1_000_000)

    assert len(logs) == 2
    assert logs[0].name in {"nginx-error.log", "free.txt"}


@pytest.mark.asyncio
async def test_read_uploaded_logs_rejects_unsupported_name() -> None:
    files = [_upload("unknown.log", b"data")]

    with pytest.raises(IngestError, match="Unsupported file"):
        await read_uploaded_logs(files, max_files=10, max_total_bytes=1_000_000)


@pytest.mark.asyncio
async def test_read_uploaded_logs_rejects_empty_file() -> None:
    files = [_upload("journal.log", b"")]

    with pytest.raises(IngestError, match="empty"):
        await read_uploaded_logs(files, max_files=10, max_total_bytes=1_000_000)


def test_build_analysis_prompt_includes_labels() -> None:
    from app.services.ingest import LogFile

    prompt = build_analysis_prompt(
        [LogFile(name="df.txt", content="Filesystem 91% full")]
    )

    assert "Disk Usage (df)" in prompt
    assert "Filesystem 91% full" in prompt

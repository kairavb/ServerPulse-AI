"""POST /analyze — upload logs and receive an AI health report."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import Settings, get_settings
from app.models.analysis import AnalysisResponse
from app.services.analysis import (
    AnalysisTimeoutError,
    RocketRideUnavailableError,
    run_analysis,
)
from app.services.ingest import (
    IngestError,
    build_analysis_prompt,
    format_uploaded_log_labels,
    read_uploaded_logs,
)
from app.services.llm_parser import ParseError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_logs(
    files: list[UploadFile] = File(..., description="Linux server log files"),
    settings: Settings = Depends(get_settings),
) -> AnalysisResponse:
    """
    Accept multiple log files, run them through RocketRide, and return analysis JSON.

    Supported filenames: journal.log, nginx-error.log, docker.log, pm2.log,
    free.txt, df.txt, systemctl.txt.
    """
    if not settings.rocketride_apikey.strip():
        raise HTTPException(
            status_code=503,
            detail=(
                "ROCKETRIDE_APIKEY is not set in backend/.env. "
                "For the local RocketRide Docker engine, use: ROCKETRIDE_APIKEY=MYAPIKEY"
            ),
        )

    try:
        logs = await read_uploaded_logs(
            files,
            max_files=settings.max_files,
            max_total_bytes=settings.max_upload_bytes,
        )
        prompt = build_analysis_prompt(logs)
        result = await run_analysis(
            prompt,
            pipeline_path=settings.pipeline_path,
            timeout_seconds=settings.analysis_timeout_seconds,
        )
        return result.model_copy(
            update={
                "uploaded_logs": format_uploaded_log_labels(logs),
                "generated_at": datetime.now(timezone.utc),
            }
        )
    except IngestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except AnalysisTimeoutError as exc:
        logger.warning("Analysis timed out: %s", exc)
        raise HTTPException(
            status_code=504,
            detail="Analysis timed out. Try again with fewer or smaller log files.",
        ) from exc
    except (RocketRideUnavailableError, ParseError) as exc:
        logger.warning("Analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred.",
        )

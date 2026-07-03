"""RocketRide pipeline execution for log analysis."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any

from rocketride import RocketRideClient
from rocketride.schema import Question

from app.models.analysis import AnalysisResponse
from app.services.llm_parser import ParseError, parse_analysis_response

logger = logging.getLogger(__name__)

ANALYSIS_INSTRUCTION = """You are a Linux server health analyst.
Review the provided logs and system snapshots.
Return ONLY a JSON object with this exact shape:
{
  "health_score": <integer 0-100>,
  "severity": "High" | "Medium" | "Low",
  "summary": "<one paragraph explaining overall health and likely root cause>",
  "issues": [
    {
      "title": "<short issue title>",
      "severity": "High" | "Medium" | "Low",
      "source": "<log source such as nginx, docker, pm2, disk, memory, systemd>",
      "detail": "<brief explanation>"
    }
  ],
  "recommendations": ["<actionable fix>", "..."]
}
Do not include markdown fences or commentary outside the JSON object."""


class AnalysisServiceError(Exception):
    """Base class for analysis failures."""


class RocketRideUnavailableError(AnalysisServiceError):
    """RocketRide could not be reached or returned an error."""


class AnalysisTimeoutError(AnalysisServiceError):
    """The pipeline did not finish within the configured timeout."""


async def run_analysis(
    log_prompt: str,
    *,
    pipeline_path: Path,
    timeout_seconds: int,
) -> AnalysisResponse:
    """
    Send the combined log bundle through RocketRide and return structured analysis.

    One pipeline run per request: connect → use → chat → disconnect.
    """
    if not pipeline_path.is_file():
        raise RocketRideUnavailableError(
            f"Pipeline file not found: {pipeline_path}"
        )

    try:
        return await asyncio.wait_for(
            _execute_pipeline(log_prompt, pipeline_path),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError as exc:
        raise AnalysisTimeoutError(
            f"Analysis timed out after {timeout_seconds} seconds."
        ) from exc


async def _execute_pipeline(log_prompt: str, pipeline_path: Path) -> AnalysisResponse:
    client = RocketRideClient()
    try:
        await client.connect()
        result = await client.use(filepath=str(pipeline_path))
        token = result["token"]
        logger.info("RocketRide pipeline started", extra={"token_prefix": token[:8]})

        question = _build_question(log_prompt)
        response = await client.chat(token=token, question=question)
        raw_answer = extract_answer(response)

        return parse_analysis_response(raw_answer)
    except (ParseError, AnalysisServiceError):
        raise
    except Exception as exc:
        logger.exception("RocketRide analysis failed")
        raise RocketRideUnavailableError("RocketRide analysis failed.") from exc
    finally:
        try:
            await client.disconnect()
        except Exception:
            logger.warning("Failed to disconnect RocketRide client", exc_info=True)


def _build_question(log_prompt: str) -> Question:
    question = Question(expectJson=True)
    question.addInstruction("Role", ANALYSIS_INSTRUCTION)
    question.addContext(log_prompt)
    question.addQuestion(
        "Analyze these server logs and return the structured health report JSON."
    )
    return question


def extract_answer(response: dict[str, Any]) -> Any:
    """
    Pull the primary answer from a RocketRide chat response.

    Prefers the default `answers` lane but falls back to `result_types` hints.
    """
    answers = response.get("answers")
    if isinstance(answers, list) and answers:
        return answers[0]

    result_types = response.get("result_types")
    if isinstance(result_types, list):
        for entry in result_types:
            if not isinstance(entry, dict):
                continue
            lane = entry.get("laneName") or entry.get("lane")
            if lane and lane in response:
                lane_value = response[lane]
                if isinstance(lane_value, list) and lane_value:
                    return lane_value[0]
                if lane_value:
                    return lane_value

    raise ParseError("RocketRide response did not contain an answer.")

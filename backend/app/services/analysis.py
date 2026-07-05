"""RocketRide pipeline execution for log analysis."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any

from rocketride import RocketRideClient
from rocketride.core.exceptions import AuthenticationException
from rocketride.schema import Question

from app.prompts.log_analysis import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_QUESTION
from app.models.analysis import AnalysisResponse
from app.services.llm_parser import ParseError, parse_analysis_response

logger = logging.getLogger(__name__)


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
    token: str | None = None
    try:
        await client.connect()
        token = await _start_pipeline(client, pipeline_path)
        logger.info("RocketRide pipeline started", extra={"token_prefix": token[:8]})

        question = _build_question(log_prompt)
        response = await client.chat(token=token, question=question)
        raw_answer = extract_answer(response)

        return parse_analysis_response(raw_answer)
    except AuthenticationException as exc:
        message = getattr(exc, "message", None) or str(exc)
        logger.warning("RocketRide authentication failed: %s", message)
        raise RocketRideUnavailableError(
            "RocketRide authentication failed. Set ROCKETRIDE_APIKEY in backend/.env "
            "(local Docker engine default: MYAPIKEY)."
        ) from exc
    except (ParseError, AnalysisServiceError):
        raise
    except Exception as exc:
        logger.exception("RocketRide analysis failed")
        raise RocketRideUnavailableError(
            f"RocketRide analysis failed: {exc}"
        ) from exc
    finally:
        if token:
            try:
                await client.terminate(token)
            except Exception:
                logger.warning(
                    "Failed to terminate RocketRide pipeline",
                    exc_info=True,
                )
        try:
            await client.disconnect()
        except Exception:
            logger.warning("Failed to disconnect RocketRide client", exc_info=True)


async def _start_pipeline(client: RocketRideClient, pipeline_path: Path) -> str:
    """
    Start the analysis pipeline, reusing an existing run if the engine reports one.

    RocketRide allows only one active pipeline per project/source. A prior request
    that did not call terminate() can leave the pipeline running; use_existing
    recovers from that state.
    """
    try:
        result = await client.use(filepath=str(pipeline_path))
    except RuntimeError as exc:
        if "already running" not in str(exc).lower():
            raise
        logger.info("RocketRide pipeline already running; reusing existing instance")
        result = await client.use(filepath=str(pipeline_path), use_existing=True)

    task_token = result.get("token", "")
    if not task_token:
        raise RocketRideUnavailableError("RocketRide did not return a pipeline token.")
    return task_token


def _build_question(log_prompt: str) -> Question:
    question = Question(expectJson=True)
    question.addInstruction("Role", ANALYSIS_SYSTEM_PROMPT)
    question.addContext(log_prompt)
    question.addQuestion(ANALYSIS_USER_QUESTION)
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

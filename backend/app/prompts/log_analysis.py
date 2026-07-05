"""
User question for the ServerPulse RocketRide pipeline.

Stage-specific instructions live in backend/pipeline/serverpulse.pipe (prompt nodes).
"""

ANALYSIS_USER_QUESTION = (
    "Analyze the uploaded Linux server logs through all pipeline stages "
    "and return the final structured health report JSON."
)

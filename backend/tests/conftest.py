"""Pytest configuration."""

import os
import sys
from pathlib import Path

# Required before importing app.main (settings load at import time).
os.environ.setdefault("ROCKETRIDE_URI", "http://localhost:5565")
os.environ.setdefault("ROCKETRIDE_APIKEY", "test-key")

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

"""Read and validate uploaded log files, then build a single analysis prompt."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import UploadFile

# Basenames we accept from the upload UI or ZIP extraction.
SUPPORTED_LOG_NAMES: frozenset[str] = frozenset(
    {
        # Logs
        "journal.log",
        "nginx-error.log",
        "nginx-access.log",
        "docker.log",
        "pm2.log",
        "syslog.log",
        "auth.log",
        "kern.log",
        "ufw.log",
        # Snapshots
        "free.txt",
        "df.txt",
        "systemctl.txt",
        "top.txt",
        "ss.txt",
        "uptime.txt",
        "iostat.txt",
        # Config files
        "nginx.conf",
        "docker-compose.yml",
        "ecosystem.config.js",
        "pm2.config.json",
    }
)

# Human-readable labels for each known log source.
LOG_LABELS: dict[str, str] = {
    "journal.log": "System Journal (journalctl)",
    "nginx-error.log": "Nginx Error Log",
    "nginx-access.log": "Nginx Access Log",
    "docker.log": "Docker Log",
    "pm2.log": "PM2 Process Manager Log",
    "syslog.log": "Syslog",
    "auth.log": "Authentication Log",
    "kern.log": "Kernel Log",
    "ufw.log": "UFW Firewall Log",
    "free.txt": "Memory Usage (free)",
    "df.txt": "Disk Usage (df)",
    "systemctl.txt": "Systemd Services (systemctl)",
    "top.txt": "Process Snapshot (top)",
    "ss.txt": "Network Sockets (ss)",
    "uptime.txt": "System Uptime",
    "iostat.txt": "Disk I/O (iostat)",
    "nginx.conf": "Nginx Configuration",
    "docker-compose.yml": "Docker Compose Configuration",
    "ecosystem.config.js": "PM2 Ecosystem Configuration",
    "pm2.config.json": "PM2 Configuration (JSON)",
}

# Per-file cap so one huge file cannot dominate the LLM context.
MAX_CHARS_PER_FILE = 50_000


@dataclass(frozen=True)
class LogFile:
    """Normalized in-memory representation of one uploaded log."""

    name: str
    content: str


class IngestError(ValueError):
    """Raised when uploads fail validation."""


async def read_uploaded_logs(
    files: list[UploadFile],
    *,
    max_files: int,
    max_total_bytes: int,
) -> list[LogFile]:
    """Validate uploads and return decoded log contents."""
    if not files:
        raise IngestError("At least one log file is required.")

    if len(files) > max_files:
        raise IngestError(f"Too many files. Maximum allowed is {max_files}.")

    logs: list[LogFile] = []
    total_bytes = 0
    seen_names: set[str] = set()

    for upload in files:
        filename = _basename(upload.filename)
        if filename not in SUPPORTED_LOG_NAMES:
            supported = ", ".join(sorted(SUPPORTED_LOG_NAMES))
            raise IngestError(
                f"Unsupported file '{filename}'. Supported names: {supported}."
            )

        if filename in seen_names:
            raise IngestError(f"Duplicate file '{filename}' is not allowed.")
        seen_names.add(filename)

        raw = await upload.read()
        if not raw:
            raise IngestError(f"File '{filename}' is empty.")

        total_bytes += len(raw)
        if total_bytes > max_total_bytes:
            raise IngestError(
                f"Total upload size exceeds the {max_total_bytes // (1024 * 1024)} MB limit."
            )

        text = raw.decode("utf-8", errors="replace")
        if len(text) > MAX_CHARS_PER_FILE:
            text = (
                text[:MAX_CHARS_PER_FILE]
                + f"\n\n[... truncated at {MAX_CHARS_PER_FILE:,} characters ...]"
            )

        logs.append(LogFile(name=filename, content=text.strip()))

    return logs


def build_analysis_prompt(logs: list[LogFile]) -> str:
    """Combine individual logs into one labeled prompt for the LLM."""
    sections: list[str] = [
        "Analyze the following Linux server diagnostic data.",
        "Identify health issues, likely root cause, and actionable recommendations.",
        "",
    ]

    for log in sorted(logs, key=lambda item: item.name):
        label = LOG_LABELS.get(log.name, log.name)
        sections.extend(
            [
                f"=== {label} ({log.name}) ===",
                log.content,
                "",
            ]
        )

    return "\n".join(sections).strip()


def format_uploaded_log_labels(logs: list[LogFile]) -> list[str]:
    """Human-readable labels for logs included in the analysis."""
    return [
        f"{LOG_LABELS.get(log.name, log.name)} ({log.name})"
        for log in sorted(logs, key=lambda item: item.name)
    ]


def _basename(filename: str | None) -> str:
    if not filename:
        raise IngestError("One or more files are missing a filename.")
    # Flatten paths from ZIP uploads or folder picks.
    return filename.replace("\\", "/").rsplit("/", 1)[-1].lower()

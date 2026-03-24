from pathlib import Path
import os
from typing import Optional, Set, cast

from app.types import AppConfig, WebhookAuthMode


def load_dotenv_file_from(env_path: Path) -> bool:
    if not env_path.exists():
        return False

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        separator_index = line.find("=")
        if separator_index <= 0:
            continue

        key = line[:separator_index].strip()
        value = line[separator_index + 1 :].strip()
        if key and os.environ.get(key) is None:
            os.environ[key] = value

    return True


def load_dotenv_file() -> None:
    candidate_paths = [
        Path.cwd() / ".env",
        Path.cwd().parent / ".env",
    ]

    for env_path in candidate_paths:
        if load_dotenv_file_from(env_path):
            return


def to_positive_integer(value: Optional[str], fallback: int) -> int:
    try:
        parsed = int(str(value))
    except (TypeError, ValueError):
        return fallback

    if parsed <= 0:
        return fallback

    return parsed


def parse_auth_mode(value: Optional[str]) -> WebhookAuthMode:
    mode = str(value or "auto").lower()
    allowed_modes: Set[WebhookAuthMode] = {"auto", "none", "bearer"}
    if mode not in allowed_modes:
        return "auto"
    return cast(WebhookAuthMode, mode)


load_dotenv_file()

config = AppConfig(
    port=to_positive_integer(os.environ.get("PORT"), 3000),
    expected_bearer_token=os.environ.get("WEBHOOK_AUTH_TOKEN", ""),
    webhook_auth_mode=parse_auth_mode(os.environ.get("WEBHOOK_AUTH_MODE")),
    max_events=to_positive_integer(os.environ.get("MAX_EVENTS"), 200),
)

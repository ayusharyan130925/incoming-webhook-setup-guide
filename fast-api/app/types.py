from dataclasses import dataclass
from typing import Literal


ZoneSeverity = Literal["low", "medium", "high", "critical"]
WebhookAuthMode = Literal["auto", "none", "bearer"]


@dataclass(frozen=True)
class AppConfig:
    port: int
    expected_bearer_token: str
    webhook_auth_mode: WebhookAuthMode
    max_events: int

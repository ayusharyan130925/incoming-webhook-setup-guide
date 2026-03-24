from typing import Optional

from app.types import WebhookAuthMode


def get_bearer_token_from_header(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return authorization[len("Bearer ") :].strip()


def should_require_bearer_auth(
    webhook_auth_mode: WebhookAuthMode, expected_bearer_token: str
) -> bool:
    if webhook_auth_mode == "none":
        return False
    if webhook_auth_mode == "bearer":
        return True
    return bool(expected_bearer_token)


def is_authorized_bearer(authorization: Optional[str], expected_token: str) -> bool:
    incoming_token = get_bearer_token_from_header(authorization)
    return bool(incoming_token) and incoming_token == expected_token

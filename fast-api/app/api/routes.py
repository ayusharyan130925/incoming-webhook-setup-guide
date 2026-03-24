from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import FileResponse

from app.config.env import config
from app.models.ppe import (
    ErrorResponse,
    EventListResponse,
    PpeEventPayload,
    StoredEvent,
    WebhookAcceptedResponse,
)
from app.services.event_store import EventStore
from app.utils.auth import is_authorized_bearer, should_require_bearer_auth

router = APIRouter()
event_store = EventStore(config.max_events)
PUBLIC_DIR = Path(__file__).resolve().parents[2] / "public"


@router.get("/health")
async def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": "incoming-webhook-service",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/events", response_model=EventListResponse)
async def list_events() -> EventListResponse:
    return EventListResponse(count=event_store.count(), items=event_store.list())


@router.get("/", response_class=FileResponse)
async def index() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "index.html")


@router.post(
    "/webhooks/ppe",
    response_model=WebhookAcceptedResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
    },
    status_code=202,
)
async def receive_ppe_webhook(
    request: Request,
    payload: PpeEventPayload,
    authorization: Optional[str] = Header(default=None),
) -> WebhookAcceptedResponse:
    requires_bearer_auth = should_require_bearer_auth(
        config.webhook_auth_mode, config.expected_bearer_token
    )

    if requires_bearer_auth and not is_authorized_bearer(
        authorization, config.expected_bearer_token
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: bearer token is missing or invalid.",
        )

    received_at = datetime.now(timezone.utc).isoformat()
    event_store.add(
        StoredEvent(
            receivedAt=received_at,
            requestIp=request.client.host if request.client else "",
            userAgent=request.headers.get("user-agent", ""),
            payload=payload,
        )
    )

    print(
        f"[{received_at}] PPE webhook accepted:",
        {
            "id": payload.id,
            "name": payload.name,
            "cameraName": payload.cameraName,
            "zoneName": payload.zoneName or None,
        },
    )

    return WebhookAcceptedResponse(eventId=payload.id)

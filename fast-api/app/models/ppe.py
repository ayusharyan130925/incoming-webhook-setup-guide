from typing import List, Union

from pydantic import BaseModel, ConfigDict, field_validator

from app.constants.ppe import ALLOWED_ZONE_SEVERITIES, SUPPORTED_EVENT_TYPE


class PpeEventPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: str
    version: str
    id: str
    name: str
    cameraName: str
    eventTime: Union[float, int]
    confidence: float
    thumbnailImage: str
    zoneName: str
    zoneSeverity: str
    timestamp: str

    @field_validator(
        "event_type",
        "version",
        "id",
        "name",
        "cameraName",
        "thumbnailImage",
        "zoneName",
        "zoneSeverity",
        "timestamp",
    )
    @classmethod
    def require_non_empty_string(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must be a non-empty string")
        return value

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        if value != SUPPORTED_EVENT_TYPE:
            raise ValueError(f"Unsupported event_type. Expected '{SUPPORTED_EVENT_TYPE}'.")
        return value

    @field_validator("thumbnailImage")
    @classmethod
    def validate_thumbnail_image(cls, value: str) -> str:
        if not value.startswith("data:image/") or ";base64," not in value:
            raise ValueError(
                "Invalid thumbnailImage. Expected a data URL like data:image/jpeg;base64,<...>."
            )
        return value

    @field_validator("zoneSeverity")
    @classmethod
    def validate_zone_severity(cls, value: str) -> str:
        if value not in ALLOWED_ZONE_SEVERITIES:
            raise ValueError("Invalid zoneSeverity. Allowed: low, medium, high, critical.")
        return value


class StoredEvent(BaseModel):
    receivedAt: str
    requestIp: str
    userAgent: str
    payload: PpeEventPayload


class EventListResponse(BaseModel):
    count: int
    items: List[StoredEvent]


class WebhookAcceptedResponse(BaseModel):
    success: bool = True
    message: str = "PPE event received."
    eventId: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str

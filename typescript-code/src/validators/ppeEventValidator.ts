import {
  ALLOWED_ZONE_SEVERITIES,
  SUPPORTED_EVENT_TYPE
} from "../constants/ppe";
import type { PpeEventPayload } from "../types/ppe";

const requiredStringFields: Array<keyof Omit<
  PpeEventPayload,
  "eventTime" | "confidence"
>> = [
  "event_type",
  "version",
  "id",
  "name",
  "cameraName",
  "thumbnailImage",
  "zoneName",
  "zoneSeverity",
  "timestamp"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDataImageUrl(value: string): boolean {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
}

export function validatePpeEventPayload(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return "Payload must be a JSON object.";
  }

  for (const key of requiredStringFields) {
    const value = payload[key];
    if (typeof value !== "string" || !value.trim()) {
      return `Missing or invalid required field: ${key}`;
    }
  }

  if (payload.event_type !== SUPPORTED_EVENT_TYPE) {
    return `Unsupported event_type. Expected '${SUPPORTED_EVENT_TYPE}'.`;
  }

  if (
    typeof payload.eventTime !== "number" ||
    !Number.isFinite(payload.eventTime)
  ) {
    return "Missing or invalid required field: eventTime";
  }

  if (typeof payload.confidence !== "number") {
    return "Missing or invalid required field: confidence";
  }

  const thumbnailImage = payload.thumbnailImage as string;
  const zoneSeverity = payload.zoneSeverity as PpeEventPayload["zoneSeverity"];

  if (!isValidDataImageUrl(thumbnailImage)) {
    return "Invalid thumbnailImage. Expected a data URL like data:image/jpeg;base64,<...>.";
  }

  if (!ALLOWED_ZONE_SEVERITIES.includes(zoneSeverity)) {
    return "Invalid zoneSeverity. Allowed: low, medium, high, critical.";
  }

  return null;
}

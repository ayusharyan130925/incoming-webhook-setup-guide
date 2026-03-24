import type { ZoneSeverity } from "../types/ppe";

export const SUPPORTED_EVENT_TYPE = "ppe_event";

export const ALLOWED_ZONE_SEVERITIES: ZoneSeverity[] = [
  "low",
  "medium",
  "high",
  "critical"
];

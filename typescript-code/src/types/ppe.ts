export type ZoneSeverity = "low" | "medium" | "high" | "critical";

export type WebhookAuthMode = "auto" | "none" | "bearer";

export interface PpeEventPayload {
  event_type: string;
  version: string;
  id: string;
  name: string;
  cameraName: string;
  eventTime: number;
  confidence: number;
  thumbnailImage: string;
  zoneName: string;
  zoneSeverity: ZoneSeverity;
  timestamp: string;
}

export interface StoredEvent {
  receivedAt: string;
  requestIp: string;
  userAgent: string;
  payload: PpeEventPayload;
}

export interface AppConfig {
  port: number;
  expectedBearerToken: string;
  webhookAuthMode: WebhookAuthMode;
  maxEvents: number;
  jsonBodyLimit: string;
}

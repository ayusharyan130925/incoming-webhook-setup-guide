# PPE Desktop Incoming Webhook Setup

This guide explains how to configure PPE Desktop to send PPE event data to your own service/application.

## Webhook Overview

- Purpose: Send PPE event data from PPE Desktop to a user-provided HTTP endpoint.
- Trigger: Every new PPE event created by the stream service.
- HTTP method: `POST`
- Content type: `application/json`
- Event type currently supported: `ppe_event`
- Delivery model: Fire-and-forget (no retry queue)

## Where To Configure In PPE Desktop

Open:
- `Notifications` -> `Webhooks`

You can:
1. Add webhook
2. Edit webhook
3. Enable/disable webhook
4. Send test webhook
5. View delivery log
6. Clear delivery log

## Fields You Configure

1. `Name` (required)
2. `URL` (required)
3. `Description` (optional)
4. `Event type` (currently only PPE Event)
5. `Authentication`
   - `None`
   - `Bearer token` (stored as `auth_token`; internal label may appear as `basic_auth`)

## Endpoint Requirements

Your receiving endpoint:
1. Must accept `POST` requests
2. Must accept JSON body
3. Should return any `2xx` status for success
4. Must respond within `15 seconds` timeout window
5. Should use `127.0.0.1` instead of `localhost` when receiver is on same machine
6. May fail on invalid/self-signed HTTPS certificates

## Headers Sent By PPE Desktop

Always:
- `Content-Type: application/json`

If bearer token is configured:
- `Authorization: Bearer <token>`

## Live Event Payload (Actual Delivery)

```json
{
  "event_type": "ppe_event",
  "version": "1.0",
  "id": "evt_abc123",
  "name": "No Helmet Detected",
  "cameraName": "Entrance Camera",
  "eventTime": 1772455148,
  "confidence": 0.94,
  "thumbnailImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "zoneName": "Entry Zone",
  "zoneSeverity": "high",
  "timestamp": "2026-03-02T12:39:08.314Z"
}
```

Notes:
1. Payload fields sent are:
   - `event_type`, `version`, `id`, `name`, `cameraName`
   - `eventTime`, `confidence`, `thumbnailImage`
   - `zoneName`, `zoneSeverity`, `timestamp`
2. `thumbnailImage` is a data URL encoded image (`data:image/<type>;base64,<...>`).
3. `zoneSeverity` values: `low | medium | high | critical`.

## Test Payload (When User Clicks Test)

```json
{
  "event_type": "ppe_event",
  "version": "1.0",
  "id": "test-event-id",
  "name": "Test PPE Violation",
  "cameraName": "Test Camera",
  "eventTime": 1772455148,
  "confidence": 0.95,
  "thumbnailImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "zoneName": "Test Zone",
  "zoneSeverity": "high",
  "timestamp": "2026-03-02T12:39:08.314Z"
}
```

## Success and Failure Rules

1. Success: HTTP `2xx`
2. Failure:
   - non-2xx status
   - timeout
   - DNS/connectivity issues
   - invalid URL
   - SSL certificate issue
3. On failure, PPE Desktop stores status/message in delivery log.

## Delivery Log Fields (In PPE Desktop UI)

Stored fields:
1. Time
2. Webhook name
3. URL
4. Method (`POST`)
5. HTTP status code (if available)
6. Success (`Yes/No`)
7. Type (`event` or `test`)
8. Message/error

Additional behavior:
- `Last triggered` updates on successful test/event delivery.
- UI fetch limit defaults to 100 entries.
- Database query supports up to 500 entries per query.

## Common Troubleshooting Messages

1. Connection refused: Receiver server not running or port blocked.
2. Host not found: Wrong hostname/DNS; use resolvable hostname or IP.
3. Request timed out: Receiver did not respond within 15s.
4. Invalid URL: Must be complete (`http://...` or `https://...`).
5. SSL certificate error: Certificate is not trusted.

## Recommended End-User Setup Steps

1. Open `Notifications` -> `Webhooks`.
2. Click `Add webhook`.
3. Enter name and endpoint URL.
4. Pick event type (`PPE Event`).
5. Select auth (`None` or `Bearer token`).
6. Save webhook.
7. Click `Test`.
8. Confirm success in Delivery Log (status code + message).
9. Keep webhook enabled.

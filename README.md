# Incoming Webhook Service (PPE Desktop)

Node.js receiver service for PPE Desktop webhook events.

This project gives you:
- A ready-to-run webhook endpoint for PPE events
- Optional Bearer token validation
- Basic health and event log endpoints
- Documentation for PPE Desktop webhook configuration

## License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).

## Requirements

- Node.js 18+ (recommended)
- npm 9+ (recommended)

## Quick Start

```bash
npm install
npm start
```

By default, the service starts on:
- `http://127.0.0.1:3000`
- Webhook endpoint: `POST http://127.0.0.1:3000/webhooks/ppe`
- Dashboard UI: `GET http://127.0.0.1:3000/`

## Configuration

Use environment variables:

- `PORT` (optional): service port (default: `3000`)
- `WEBHOOK_AUTH_MODE` (optional): auth strategy for incoming webhooks
  - `none`: never require token
  - `bearer`: always require token
  - `auto` (default): require token only if `WEBHOOK_AUTH_TOKEN` is set
- `WEBHOOK_AUTH_TOKEN` (optional): bearer token value to validate
- `MAX_EVENTS` (optional): in-memory event history size (default: `200`)

The app auto-loads values from a local `.env` file.

Examples:

```bash
# No auth required
WEBHOOK_AUTH_MODE=none npm start

# Always require bearer auth
WEBHOOK_AUTH_MODE=bearer WEBHOOK_AUTH_TOKEN=my-secret-token npm start

# Auto mode (default): token required only when token exists
WEBHOOK_AUTH_MODE=auto WEBHOOK_AUTH_TOKEN=my-secret-token npm start
```

## PPE Desktop App Setup (End User Flow)

In PPE Desktop:

1. Open `Notifications` -> `Webhooks`.
2. Click `Add webhook`.
3. Enter webhook name and URL.
4. Select event type: `PPE Event`.
5. Choose authentication:
   - `None`, or
   - `Bearer token` (must match `WEBHOOK_AUTH_TOKEN` if enabled on this service)
6. Save.
7. Click `Test`.
8. Check Delivery Log for success (2xx).
9. Keep webhook enabled.

Important:
- If receiver runs on same machine, use `127.0.0.1` (not `localhost`).
- Use a full URL (`http://...` or `https://...`).

## Endpoints in This Service

### 1) Health check

- `GET /health`

Example:

```bash
curl http://127.0.0.1:3000/health
```

### 2) Receive PPE webhook

- `POST /webhooks/ppe`
- Content type: `application/json`
- Returns:
  - `202` on accepted payload
  - `400` for invalid payload
  - `401` when bearer token is required but invalid/missing

Example:

```bash
curl -X POST http://127.0.0.1:3000/webhooks/ppe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token" \
  -d '{
    "event_type":"ppe_event",
    "version":"1.0",
    "id":"evt_abc123",
    "name":"No Helmet Detected",
    "cameraName":"Entrance Camera",
    "eventTime":1772455148,
    "confidence":0.94,
    "thumbnailImage":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "zoneName":"Entry Zone",
    "zoneSeverity":"high",
    "timestamp":"2026-03-02T12:39:08.314Z"
  }'
```

### 3) View received events

- `GET /events`
- Returns recent in-memory deliveries for troubleshooting

Example:

```bash
curl http://127.0.0.1:3000/events
```

### 4) Dashboard UI

- `GET /`
- One-page frontend showing incoming webhook cards with:
  - image preview (if `thumbnailImage` exists)
  - event details (all webhook payload fields)
  - auto-refresh every 4 seconds

## Payload Notes

- Supported event type: `ppe_event`
- Receiver expects exactly these payload fields:
  - `event_type`
  - `version`
  - `id`
  - `name`
  - `cameraName`
  - `eventTime`
  - `confidence`
  - `thumbnailImage`
  - `zoneName`
  - `zoneSeverity`
  - `timestamp`
- `thumbnailImage` must be a data URL string like `data:image/jpeg;base64,<...>`
- Allowed `zoneSeverity`: `low`, `medium`, `high`, `critical`

See full user-facing setup and payload examples in [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md).

## Troubleshooting

- `Connection refused`: receiver is not running or wrong port.
- `Host not found`: wrong hostname/DNS; use valid IP/hostname.
- `Request timed out`: receiver did not return within 15 seconds.
- `Invalid URL`: webhook URL must be full URL with protocol.
- `SSL certificate error`: certificate is not trusted or invalid.

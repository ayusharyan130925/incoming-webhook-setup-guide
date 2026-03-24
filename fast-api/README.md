# Incoming Webhook Service (FastAPI)

FastAPI + Pydantic implementation of the PPE Desktop incoming webhook receiver.

## What This App Does

- receives PPE event webhooks at `POST /webhooks/ppe`
- optionally validates a Bearer token
- stores recent events in memory
- exposes `GET /health` and `GET /events`
- serves a dashboard UI at `GET /`

## Requirements

- Python 3.9+ supported
- `pip` available

## Install and Run

From this folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
python3 run.py
```

Important:

- use `pip3 install -r requirements.txt`
- do not use `pip3 install requirements.txt`

For development with auto-reload:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

## Default URLs

- App: `http://127.0.0.1:3000`
- Health: `GET http://127.0.0.1:3000/health`
- Events: `GET http://127.0.0.1:3000/events`
- Webhook: `POST http://127.0.0.1:3000/webhooks/ppe`
- Dashboard: `GET http://127.0.0.1:3000/`

## Environment Variables

You can place `.env` either:

- in `fast-api/.env`, or
- in the repository root `.env`

Supported variables:

- `PORT`
  Default: `3000`
- `WEBHOOK_AUTH_MODE`
  Values: `none`, `bearer`, `auto`
- `WEBHOOK_AUTH_TOKEN`
  Bearer token to match when auth is enabled
- `MAX_EVENTS`
  Number of recent events to keep in memory

Examples:

```bash
WEBHOOK_AUTH_MODE=none python3 run.py
WEBHOOK_AUTH_MODE=bearer WEBHOOK_AUTH_TOKEN=my-secret-token python3 run.py
WEBHOOK_AUTH_MODE=auto WEBHOOK_AUTH_TOKEN=my-secret-token python3 run.py
```

## API Endpoints

### `GET /health`

Returns server health and current time.

Example:

```bash
curl http://127.0.0.1:3000/health
```

### `GET /events`

Returns in-memory event history.

Example:

```bash
curl http://127.0.0.1:3000/events
```

### `POST /webhooks/ppe`

Accepts PPE event JSON payloads.

Responses:

- `202` accepted
- `400` invalid payload
- `401` missing or invalid Bearer token

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

### `GET /`

Serves the dashboard in `public/index.html`.

The dashboard:

- lists received events
- previews the payload image
- auto-refreshes every 4 seconds

## Expected Payload

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

Validation rules:

- `event_type` must be `ppe_event`
- all string fields must be present and non-empty
- `eventTime` must be numeric
- `confidence` must be numeric
- `thumbnailImage` must be a valid data URL
- `zoneSeverity` must be one of `low`, `medium`, `high`, `critical`

## Project Structure

```text
fast-api/
├── requirements.txt
├── run.py
├── public/
│   └── index.html
└── app/
    ├── main.py
    ├── types.py
    ├── api/
    ├── config/
    ├── constants/
    ├── models/
    ├── services/
    └── utils/
```

## PPE Desktop Setup

1. Open `Notifications -> Webhooks`.
2. Click `Add webhook`.
3. Enter the webhook URL.
4. Select event type `PPE Event`.
5. Choose `None` or `Bearer token`.
6. Save.
7. Click `Test`.
8. Confirm you get a `2xx` response.

Detailed PPE Desktop setup: [../WEBHOOK_SETUP.md](../WEBHOOK_SETUP.md)

## Troubleshooting

- `ModuleNotFoundError: fastapi`: install dependencies with `pip3 install -r requirements.txt`.
- `401 Unauthorized`: token mismatch or missing `Authorization` header.
- `400 Bad Request`: the payload format is invalid.
- `Connection refused`: the server is not running or the wrong port is used.
- `Address already in use`: another app is already using the configured port.

## License

MIT License. See [../LICENSE](../LICENSE).

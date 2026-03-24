# PPE Desktop Incoming Webhook Receivers

This repository contains two complete receiver implementations for PPE Desktop incoming webhooks:

- [typescript-code](./typescript-code): Node.js + Express + TypeScript
- [fast-api](./fast-api): Python + FastAPI

Both implementations provide the same core behavior:

- `POST /webhooks/ppe` to receive PPE event webhooks
- optional Bearer token validation
- `GET /health` health check
- `GET /events` in-memory event history
- `GET /` dashboard UI for recent events

If you only need PPE Desktop configuration steps, see [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md).

## Project Layout

```text
incoming-webhook-setup-guide/
├── WEBHOOK_SETUP.md
├── LICENSE
├── README.md
├── typescript-code/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   ├── public/
│   └── README.md
└── fast-api/
    ├── requirements.txt
    ├── app/
    ├── public/
    ├── run.py
    └── README.md
```

## Choose an Implementation

Use `typescript-code` if:

- you want a Node.js service
- you prefer TypeScript and npm tooling
- you want `npm run dev` / `npm run build`

Use `fast-api` if:

- you want a Python service
- you prefer FastAPI and Pydantic validation
- you want to run with `python3 run.py` or `uvicorn`

## Shared API Behavior

### Base URL

By default, both apps run on:

- `http://127.0.0.1:3000`

### Endpoints

- `GET /health`
- `GET /events`
- `POST /webhooks/ppe`
- `GET /`

### Authentication Modes

Configure auth using environment variables:

- `WEBHOOK_AUTH_MODE=none`
  No token required.
- `WEBHOOK_AUTH_MODE=bearer`
  Always require `Authorization: Bearer <token>`.
- `WEBHOOK_AUTH_MODE=auto`
  Require Bearer auth only if `WEBHOOK_AUTH_TOKEN` is set.

### Environment Variables

Both implementations support these variables:

- `PORT`
- `WEBHOOK_AUTH_MODE`
- `WEBHOOK_AUTH_TOKEN`
- `MAX_EVENTS`

Both apps load `.env` from:

- their own folder, or
- the repository root

### Supported Payload

Both apps expect this PPE event payload:

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

Rules:

- `event_type` must be `ppe_event`
- `zoneSeverity` must be one of `low`, `medium`, `high`, `critical`
- `thumbnailImage` must be a data URL

## Quick Start

### TypeScript

```bash
cd typescript-code
npm install
npm run build
npm start
```

### FastAPI

```bash
cd fast-api
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
python3 run.py
```

## Testing with curl

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

## PPE Desktop Setup

In PPE Desktop:

1. Open `Notifications -> Webhooks`.
2. Click `Add webhook`.
3. Enter the receiver URL.
4. Select event type `PPE Event`.
5. Choose authentication:
   - `None`, or
   - `Bearer token`
6. Save.
7. Click `Test`.
8. Confirm the receiver returns success.

Important:

- Use `127.0.0.1` instead of `localhost` when the receiver is on the same machine.
- Use a full URL including `http://` or `https://`.

## Troubleshooting

- `pip3 install requirements.txt` is wrong. Use `pip3 install -r requirements.txt`.
- `Connection refused` usually means the app is not running or the port is wrong.
- `401 Unauthorized` means the Bearer token is missing or does not match.
- `400 Bad Request` means the payload is missing fields or contains invalid values.
- `Invalid URL` means PPE Desktop was given a malformed endpoint.
- `SSL certificate error` means the target HTTPS certificate is invalid or untrusted.

## License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).

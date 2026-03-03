const {
  SUPPORTED_EVENT_TYPE,
  ALLOWED_ZONE_SEVERITIES
} = require("../constants/ppe");

const requiredStringFields = [
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

function isValidDataImageUrl(value) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
}

function validatePpeEventPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Payload must be a JSON object.";
  }

  for (const key of requiredStringFields) {
    if (typeof payload[key] !== "string" || !payload[key].trim()) {
      return `Missing or invalid required field: ${key}`;
    }
  }

  if (payload.event_type !== SUPPORTED_EVENT_TYPE) {
    return `Unsupported event_type. Expected '${SUPPORTED_EVENT_TYPE}'.`;
  }

  if (typeof payload.eventTime !== "number" || !Number.isFinite(payload.eventTime)) {
    return "Missing or invalid required field: eventTime";
  }

  if (typeof payload.confidence !== "number") {
    return "Missing or invalid required field: confidence";
  }

  if (!isValidDataImageUrl(payload.thumbnailImage)) {
    return "Invalid thumbnailImage. Expected a data URL like data:image/jpeg;base64,<...>.";
  }

  if (
    payload.zoneSeverity &&
    !ALLOWED_ZONE_SEVERITIES.includes(payload.zoneSeverity)
  ) {
    return "Invalid zoneSeverity. Allowed: low, medium, high, critical.";
  }

  return null;
}

module.exports = {
  validatePpeEventPayload
};

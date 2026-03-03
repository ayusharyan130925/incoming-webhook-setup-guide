const fs = require("fs");
const path = require("path");

function loadDotEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContent = fs.readFileSync(envPath, "utf8");
  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile();

function toPositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseAuthMode(value) {
  const mode = String(value || "auto").toLowerCase();
  const allowedModes = ["auto", "none", "bearer"];
  if (!allowedModes.includes(mode)) {
    return "auto";
  }
  return mode;
}

module.exports = {
  port: toPositiveInteger(process.env.PORT, 3000),
  expectedBearerToken: process.env.WEBHOOK_AUTH_TOKEN || "",
  webhookAuthMode: parseAuthMode(process.env.WEBHOOK_AUTH_MODE),
  maxEvents: toPositiveInteger(process.env.MAX_EVENTS, 200),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "25mb"
};

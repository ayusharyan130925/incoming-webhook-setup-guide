import express from "express";
import path from "path";
import config from "./config/env";
import errorHandler from "./middleware/errorHandler";
import createEventRoutes from "./routes/eventRoutes";
import healthRoutes from "./routes/healthRoutes";
import createWebhookRoutes from "./routes/webhookRoutes";
import EventStore from "./services/eventStore";
import type { StoredEvent } from "./types/ppe";

const app = express();
const eventStore = new EventStore<StoredEvent>(config.maxEvents);

// PPE payloads may contain base64 thumbnails, so keep request limit configurable.
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(healthRoutes);
app.use(createEventRoutes(eventStore));
app.use(
  createWebhookRoutes({
    eventStore,
    expectedBearerToken: config.expectedBearerToken,
    webhookAuthMode: config.webhookAuthMode
  })
);

app.use(errorHandler);

export { app, config };

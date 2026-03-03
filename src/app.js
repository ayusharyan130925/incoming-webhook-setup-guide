const express = require("express");
const path = require("path");
const config = require("./config/env");
const EventStore = require("./services/eventStore");
const healthRoutes = require("./routes/healthRoutes");
const createEventRoutes = require("./routes/eventRoutes");
const createWebhookRoutes = require("./routes/webhookRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const eventStore = new EventStore(config.maxEvents);

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

module.exports = {
  app,
  config
};

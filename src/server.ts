import { app, config } from "./app";

if (config.webhookAuthMode === "bearer" && !config.expectedBearerToken) {
  console.error(
    "Invalid configuration: WEBHOOK_AUTH_MODE=bearer requires WEBHOOK_AUTH_TOKEN."
  );
  process.exit(1);
}

app.listen(config.port, "0.0.0.0", () => {
  console.log(
    `Incoming webhook service running on http://127.0.0.1:${config.port}`
  );
  console.log(`POST endpoint: http://127.0.0.1:${config.port}/webhooks/ppe`);
  console.log(`Webhook auth mode: ${config.webhookAuthMode}`);
});

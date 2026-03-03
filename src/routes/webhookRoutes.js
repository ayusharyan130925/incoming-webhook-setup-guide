const express = require("express");
const { isAuthorizedBearer, shouldRequireBearerAuth } = require("../utils/auth");
const { validatePpeEventPayload } = require("../validators/ppeEventValidator");

function createWebhookRoutes({
  eventStore,
  expectedBearerToken,
  webhookAuthMode
}) {
  const router = express.Router();

  router.post("/webhooks/ppe", (req, res) => {
    const requiresBearerAuth = shouldRequireBearerAuth({
      webhookAuthMode,
      expectedBearerToken
    });

    if (
      requiresBearerAuth &&
      !isAuthorizedBearer(req.headers.authorization, expectedBearerToken)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: bearer token is missing or invalid."
      });
    }

    const validationError = validatePpeEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const receivedAt = new Date().toISOString();
    eventStore.add({
      receivedAt,
      requestIp: req.ip,
      userAgent: req.headers["user-agent"] || "",
      payload: req.body
    });

    console.log(`[${receivedAt}] PPE webhook accepted:`, {
      id: req.body.id,
      name: req.body.name,
      cameraName: req.body.cameraName,
      zoneName: req.body.zoneName || null
    });

    return res.status(202).json({
      success: true,
      message: "PPE event received.",
      eventId: req.body.id
    });
  });

  return router;
}

module.exports = createWebhookRoutes;

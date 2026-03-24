import { Router } from "express";
import EventStore from "../services/eventStore";
import type {
  PpeEventPayload,
  StoredEvent,
  WebhookAuthMode
} from "../types/ppe";
import { isAuthorizedBearer, shouldRequireBearerAuth } from "../utils/auth";
import { validatePpeEventPayload } from "../validators/ppeEventValidator";

interface WebhookRouteDependencies {
  eventStore: EventStore<StoredEvent>;
  expectedBearerToken: string;
  webhookAuthMode: WebhookAuthMode;
}

export default function createWebhookRoutes({
  eventStore,
  expectedBearerToken,
  webhookAuthMode
}: WebhookRouteDependencies): Router {
  const router = Router();

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

    const payload = req.body as PpeEventPayload;
    const receivedAt = new Date().toISOString();

    eventStore.add({
      receivedAt,
      requestIp: req.ip ?? "",
      userAgent: req.get("user-agent") ?? "",
      payload
    });

    console.log(`[${receivedAt}] PPE webhook accepted:`, {
      id: payload.id,
      name: payload.name,
      cameraName: payload.cameraName,
      zoneName: payload.zoneName || null
    });

    return res.status(202).json({
      success: true,
      message: "PPE event received.",
      eventId: payload.id
    });
  });

  return router;
}

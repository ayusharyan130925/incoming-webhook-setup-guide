import { Router } from "express";
import EventStore from "../services/eventStore";
import type { StoredEvent } from "../types/ppe";

export default function createEventRoutes(
  eventStore: EventStore<StoredEvent>
): Router {
  const router = Router();

  router.get("/events", (_req, res) => {
    res.status(200).json({
      count: eventStore.count(),
      items: eventStore.list()
    });
  });

  return router;
}

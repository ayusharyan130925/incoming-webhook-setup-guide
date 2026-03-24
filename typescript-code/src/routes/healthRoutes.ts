import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "incoming-webhook-service",
    time: new Date().toISOString()
  });
});

export default router;

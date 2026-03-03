const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "incoming-webhook-service",
    time: new Date().toISOString()
  });
});

module.exports = router;

const express = require("express");

function createEventRoutes(eventStore) {
  const router = express.Router();

  router.get("/events", (_req, res) => {
    res.status(200).json({
      count: eventStore.count(),
      items: eventStore.list()
    });
  });

  return router;
}

module.exports = createEventRoutes;

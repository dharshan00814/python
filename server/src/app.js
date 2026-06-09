import cors from "cors";
import express from "express";

import { healthRouter } from "./routes/health.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/health", healthRouter);
  app.use("/api", apiRouter);

  app.use((error, request, response, next) => {
    void request;
    void next;

    const statusCode = error.statusCode || 500;
    response.status(statusCode).json({
      message: error.message || "Internal server error",
    });
  });

  return app;
}
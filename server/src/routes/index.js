import { Router } from "express";

import { apiV1Router } from "./api.js";

export const apiRouter = Router();

apiRouter.get("/", (request, response) => {
  void request;

  response.json({
    name: "Hostel & Mess Management API",
    version: "1.0.0",
    modules: [
      "auth",
      "dashboard",
      "hostels",
      "students",
      "mess",
      "fees",
      "complaints",
      "reports",
    ],
  });
});

apiRouter.use("/v1", apiV1Router);
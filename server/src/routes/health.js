import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (request, response) => {
  void request;

  response.json({
    status: "ok",
    service: "hostel-mess-management",
    timestamp: new Date().toISOString(),
  });
});
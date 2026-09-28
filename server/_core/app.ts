import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { handleAsaasWebhook } from "../webhooks/asaas";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createExpressApp() {
  const app = express();
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Webhook oficial do Asaas (PIX automático e reembolsos CDC)
  app.post("/api/webhooks/asaas", handleAsaasWebhook);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}

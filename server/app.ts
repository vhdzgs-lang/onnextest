import express, { type NextFunction, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import fs from "node:fs";
import path from "node:path";
import { env } from "./env";
import { logger } from "./logger";
import { appRouter } from "./routers";
import type { Deps } from "./trpc";

/** Límite simple por IP para el envío del test (evita abuso del generador de PDF y del correo). */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "desconocido";
    const nowMs = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => nowMs - t < windowMs);
    if (recent.length >= max) {
      res.status(429).json({ error: { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." } });
      return;
    }
    recent.push(nowMs);
    hits.set(key, recent);
    next();
  };
}

export function createApp(deps: Deps, options: { staticDir?: string; health?: () => Record<string, unknown> } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", /^\d+$/.test(env.trustProxy) ? Number(env.trustProxy) : env.trustProxy);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ...(options.health?.() ?? {}) });
  });

  app.use("/api/trpc/test.submit", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
  app.use(
    "/api/trpc",
    express.json({ limit: "100kb" }),
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({ deps }),
      onError({ path: procedure, error }) {
        if (error.code === "BAD_REQUEST") logger.warn("ROUTER", "Solicitud rechazada por validación", { procedure });
        else if (error.code !== "INTERNAL_SERVER_ERROR") logger.warn("ROUTER", "Error de tRPC", { procedure, code: error.code });
      },
    }),
  );

  if (options.staticDir && fs.existsSync(options.staticDir)) {
    const dir = options.staticDir;
    app.use(express.static(dir, { index: false, maxAge: "1h" }));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(dir, "index.html"));
    });
  }

  return app;
}

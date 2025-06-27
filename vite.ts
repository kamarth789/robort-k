import { Server } from "http";
import { createServer as createViteServer } from "vite";
import type { Express } from "express";
import express from "express";
import path from "path";

export function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  console.log(`${timestamp} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    },
    appType: "spa",
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  app.use(express.static("dist/public"));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve("dist/public/index.html"));
  });
}
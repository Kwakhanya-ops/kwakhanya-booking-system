import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Express } from "express";
import type { Server } from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app: Express, server: Server) {
  const vite = await (await import("vite")).createServer({
    root: path.resolve(__dirname, "..", "client"),
    logLevel: "info",
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
      hmr: {
        port: 5173,
      },
    },
    appType: "spa",
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      "Client build not found. Please run `npm run build` first."
    );
  }

  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA fallback)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    
    res.sendFile(path.join(distPath, "index.html"));
  });
}

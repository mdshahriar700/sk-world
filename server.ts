import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { handleApiRequest } from "./src/lib/api-controller";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API router for Express backend (dev & standalone Node production)
  app.all("/api/*", async (req, res) => {
    try {
      const query: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.query)) {
        query[k] = String(v);
      }

      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
      }

      const pathStr = req.path;
      const method = req.method;
      const body = req.body;

      const { status, data } = await handleApiRequest(pathStr, method, body, query, headers, process.env);
      res.status(status).json(data);
    } catch (err: any) {
      console.error("[Express API Error]", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SK WORL Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

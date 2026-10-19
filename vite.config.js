import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev-server middleware that forwards /api/summarize to Anthropic using a
// server-side key. The key is read from ANTHROPIC_API_KEY (no VITE_ prefix),
// so Vite never bundles it into the browser code.
function anthropicProxy(apiKey) {
  return {
    name: "anthropic-proxy",
    configureServer(server) {
      server.middlewares.use("/api/summarize", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end();
        }
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ error: "ANTHROPIC_API_KEY is not set" }));
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const r = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body,
            });
            const text = await r.text();
            res.statusCode = r.status;
            res.setHeader("Content-Type", "application/json");
            res.end(text);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // "" = load all vars, not just VITE_*
  return {
    plugins: [react(), anthropicProxy(env.ANTHROPIC_API_KEY)],
    server: { host: true },
  };
});

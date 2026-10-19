// Vercel serverless function: forwards summarize requests to Anthropic.
// Env vars (set in the Vercel dashboard):
//   ANTHROPIC_API_KEY  - required
//   ACCESS_CODE        - optional but strongly recommended; if set, requests
//                        must send a matching x-access-code header.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" });

  const required = process.env.ACCESS_CODE;
  if (required && req.headers["x-access-code"] !== required) {
    return res.status(401).json({ error: "Invalid access code" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    // Only forward what the app needs, and cap output size.
    const payload = {
      model: "claude-sonnet-4-6",
      max_tokens: Math.min(body.max_tokens || 1000, 1000),
      messages: body.messages,
    };
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

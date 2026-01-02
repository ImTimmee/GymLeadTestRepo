import { getUserFromRequest } from "./_lib/auth.js";

export default async function handler(req, res) {
  try {
    const user = await getUserFromRequest(req);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, user }));
  } catch (e) {
    res.statusCode = e?.statusCode || 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: e?.message || String(e) }));
  }
}

// extra note for deployment

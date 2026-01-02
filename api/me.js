import { getUserFromRequest } from "./_lib/auth.js";

export default async function handler(req, res) {
  try {
    const user = await getUserFromRequest(req);
    const body = JSON.stringify({ ok: true, user });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(body);
  } catch (e) {
    const body = JSON.stringify({
      ok: false,
      error: e?.message || String(e),
    });

    res.statusCode = e?.statusCode || 500;
    res.setHeader("Content-Type", "application/json");
    res.end(body);
  }
}

export default function handler(req, res) {
  const body = JSON.stringify({
    ok: true,
    ping: true,
    now: new Date().toISOString(),
  });

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(body);
}

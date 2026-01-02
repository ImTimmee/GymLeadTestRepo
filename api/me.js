const { getUserFromRequest } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  try {
    const user = await getUserFromRequest(req);
    res.status(200).json({ ok: true, user });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message || "Server error" });
  }
};

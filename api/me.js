module.exports = async function handler(req, res) {
  try {
    // Lazy import zodat we errors kunnen vangen en teruggeven
    const { getUserFromRequest } = require("./_lib/auth");
    const user = await getUserFromRequest(req);
    res.status(200).json({ ok: true, user });
  } catch (e) {
    res
      .status(500)
      .json({
        ok: false,
        error: e && e.message ? e.message : String(e),
        hint:
          "Check firebase-admin dependency + FIREBASE_* env vars (private key formatting).",
      });
  }
};

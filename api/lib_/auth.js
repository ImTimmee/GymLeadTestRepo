const { admin } = require("./firebaseAdmin");

async function getUserFromRequest(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return null;

  const token = match[1];
  const decoded = await admin().auth().verifyIdToken(token);

  return { uid: decoded.uid, email: decoded.email || null };
}

module.exports = { getUserFromRequest };

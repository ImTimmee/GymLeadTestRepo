import { getAdmin } from "./firebaseAdmin.js";

export async function getUserFromRequest(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return null;

  const token = match[1];
  const decoded = await getAdmin().auth().verifyIdToken(token);

  return { uid: decoded.uid, email: decoded.email || null };
}

export async function requireUser(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

export function requireAdmin(user) {
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const email = (user.email || "").toLowerCase();
  if (!allow.includes(email)) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
}

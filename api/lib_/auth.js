import { getAdmin } from "./firebaseAdmin.js";

export async function getUserFromRequest(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return null;

  const token = match[1];
  const decoded = await getAdmin().auth().verifyIdToken(token);

  return { uid: decoded.uid, email: decoded.email || null };
}

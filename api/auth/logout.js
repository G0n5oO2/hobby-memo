import { destroySession, clearSessionCookie } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  await destroySession(req);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

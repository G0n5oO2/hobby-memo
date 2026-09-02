import { prisma } from "../_lib/db.js";
import { verifyPassword, createSession, setSessionCookie } from "../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "メールアドレスとパスワードを入力してください。" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "メールアドレスまたはパスワードが違います。" });
    return;
  }

  const sessionId = await createSession(user.id);
  setSessionCookie(res, sessionId);

  res.status(200).json({
    id: user.id,
    email: user.email,
    onboardingStep: user.onboardingStep,
  });
}

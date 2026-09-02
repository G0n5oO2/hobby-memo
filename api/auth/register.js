import { prisma } from "../_lib/db.js";
import { hashPassword, createSession, setSessionCookie } from "../_lib/session.js";
import { assertSafeFields } from "../_lib/validate.js";

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

  const error = assertSafeFields({
    email: { value: email, maxLength: 254 },
    password: { value: password, maxLength: 200 },
  });
  if (error) {
    res.status(400).json({ error });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "パスワードは8文字以上にしてください。" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "このメールアドレスは既に登録されています。" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const sessionId = await createSession(user.id);
  setSessionCookie(res, sessionId);

  res.status(201).json({
    id: user.id,
    email: user.email,
    onboardingStep: user.onboardingStep,
  });
}

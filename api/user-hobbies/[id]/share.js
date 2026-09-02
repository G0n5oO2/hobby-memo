import crypto from "node:crypto";
import { prisma } from "../../_lib/db.js";
import { requireUser } from "../../_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;
  const userHobby = await prisma.userHobby.findUnique({ where: { id } });
  if (!userHobby || userHobby.userId !== user.id) {
    res.status(404).json({ error: "対象の趣味が見つかりません。" });
    return;
  }

  const shareToken = userHobby.shareToken ?? crypto.randomBytes(8).toString("hex");
  if (!userHobby.shareToken) {
    await prisma.userHobby.update({ where: { id }, data: { shareToken } });
  }

  res.status(200).json({ shareToken });
}

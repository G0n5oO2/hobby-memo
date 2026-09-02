import { prisma } from "../../_lib/db.js";
import { requireUser } from "../../_lib/session.js";
import { assertSafeFields } from "../../_lib/validate.js";

const MAX_CHARACTER_LEVEL = 10;
const ENTRIES_PER_LEVEL = 3; // 3日記ごとにキャラクターが1レベル成長

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;
  const userHobby = await prisma.userHobby.findUnique({ where: { id } });
  if (!userHobby || userHobby.userId !== user.id) {
    res.status(404).json({ error: "対象の趣味が見つかりません。" });
    return;
  }

  if (req.method === "GET") {
    const diaryEntries = await prisma.diaryEntry.findMany({
      where: { userHobbyId: id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ diaryEntries });
    return;
  }

  if (req.method === "POST") {
    const { content } = req.body ?? {};
    if (!content || !content.trim()) {
      res.status(400).json({ error: "日記の内容を入力してください。" });
      return;
    }

    const error = assertSafeFields({ 日記: { value: content, maxLength: 1000 } });
    if (error) {
      res.status(400).json({ error });
      return;
    }

    await prisma.diaryEntry.create({
      data: { userHobbyId: id, content: content.trim() },
    });

    const entryCount = await prisma.diaryEntry.count({ where: { userHobbyId: id } });
    const newLevel = Math.min(MAX_CHARACTER_LEVEL, 1 + Math.floor(entryCount / ENTRIES_PER_LEVEL));

    const updated = await prisma.userHobby.update({
      where: { id },
      data: { characterLevel: newLevel },
      include: { hobby: true, diaryEntries: { orderBy: { createdAt: "desc" } } },
    });

    res.status(201).json({ userHobby: updated });
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}

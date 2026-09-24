import { prisma } from "../_lib/db.js";
import { requireUser } from "../_lib/session.js";
import { assertSafeFields } from "../_lib/validate.js";

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const userHobbies = await prisma.userHobby.findMany({
      where: { userId: user.id },
      include: { hobby: true, diaryEntries: { orderBy: { entryDate: "desc" } } },
      orderBy: { startedAt: "desc" },
    });
    res.status(200).json({ userHobbies });
    return;
  }

  if (req.method === "POST") {
    const { hobbyId, characterName } = req.body ?? {};
    if (!hobbyId || !characterName) {
      res.status(400).json({ error: "趣味とキャラクター名を指定してください。" });
      return;
    }

    const error = assertSafeFields({
      キャラクター名: { value: characterName, maxLength: 30 },
    });
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const hobby = await prisma.hobby.findUnique({ where: { id: hobbyId } });
    if (!hobby) {
      res.status(404).json({ error: "指定された趣味が見つかりません。" });
      return;
    }

    const userHobby = await prisma.userHobby.create({
      data: { userId: user.id, hobbyId, characterName },
      include: { hobby: true },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStep: "DONE" },
    });

    res.status(201).json({ userHobby });
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}

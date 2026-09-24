import { prisma } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { token } = req.query;
  const userHobby = await prisma.userHobby.findUnique({
    where: { shareToken: token },
    include: {
      hobby: true,
      diaryEntries: { orderBy: { entryDate: "desc" }, take: 5 },
    },
  });

  if (!userHobby) {
    res.status(404).json({ error: "共有ページが見つかりませんでした。" });
    return;
  }

  const daysSinceStart = Math.max(
    1,
    Math.ceil((Date.now() - new Date(userHobby.startedAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  res.status(200).json({
    hobbyName: userHobby.hobby.name,
    characterName: userHobby.characterName,
    characterLevel: userHobby.characterLevel,
    startedAt: userHobby.startedAt,
    daysSinceStart,
    diaryCount: await prisma.diaryEntry.count({ where: { userHobbyId: userHobby.id } }),
    recentDiaryEntries: userHobby.diaryEntries,
  });
}

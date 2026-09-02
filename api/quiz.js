import { prisma } from "./_lib/db.js";
import { requireUser } from "./_lib/session.js";
import { QUIZ_QUESTIONS, EXTENDED_QUIZ_QUESTIONS } from "../shared/quizQuestions.js";

const ALL_QUESTIONS = [...QUIZ_QUESTIONS, ...EXTENDED_QUIZ_QUESTIONS];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const { answers } = req.body ?? {};
  if (!answers || typeof answers !== "object") {
    res.status(400).json({ error: "回答を送信してください。" });
    return;
  }

  // 回答から得られたタグを集計（イレギュラー1: 未回答があってもエラーにしない）
  const tagWeights = {};
  for (const question of ALL_QUESTIONS) {
    const selectedIndex = answers[question.id];
    const option = question.options[selectedIndex];
    if (!option) continue;
    for (const tag of option.tags) {
      tagWeights[tag] = (tagWeights[tag] ?? 0) + 1;
    }
  }

  const allHobbies = await prisma.hobby.findMany();

  const scored = allHobbies
    .map((hobby) => {
      const hobbyTags = hobby.tags.split(",").map((t) => t.trim());
      const score = hobbyTags.reduce((sum, tag) => sum + (tagWeights[tag] ?? 0), 0);
      return { hobby, score };
    })
    .sort((a, b) => b.score - a.score || a.hobby.level - b.hobby.level);

  // レベル別に上位を並べる（始めやすさで整理して見せる）
  const byLevel = { 1: [], 2: [], 3: [] };
  for (const { hobby } of scored) {
    if (byLevel[hobby.level]?.length < 3) {
      byLevel[hobby.level].push(hobby);
    }
  }

  // イレギュラー1: スコアが全く付かない(空っぽ回答)場合は始めやすい順のフォールバック
  const hasAnyScore = scored.some((s) => s.score > 0);
  if (!hasAnyScore) {
    byLevel[1] = allHobbies.filter((h) => h.level === 1).slice(0, 3);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingStep: "SUGGESTIONS" },
  });

  res.status(200).json({ suggestions: byLevel });
}

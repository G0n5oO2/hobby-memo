import { prisma } from "./_lib/db.js";
import { isSafeText } from "./_lib/validate.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (q && !isSafeText(q, { maxLength: 100 })) {
    res.status(400).json({ error: "検索キーワードに使用できない文字が含まれています。" });
    return;
  }

  // イレギュラー1: 検索キーワードが空 → 始めやすい(level=1)趣味をフォールバック提案
  const hobbies = q
    ? await prisma.hobby.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tags: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { level: "asc" },
      })
    : await prisma.hobby.findMany({
        where: { level: 1 },
        orderBy: { name: "asc" },
      });

  res.status(200).json({ hobbies });
}

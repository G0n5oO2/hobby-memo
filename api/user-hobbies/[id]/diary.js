import { prisma } from "../../_lib/db.js";
import { requireUser } from "../../_lib/session.js";
import { assertSafeFields } from "../../_lib/validate.js";
import { MOOD_VALUES } from "../../../shared/moods.js";

const MAX_CHARACTER_LEVEL = 10;
const ENTRIES_PER_LEVEL = 3; // 3日記ごとにキャラクターが1レベル成長

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// entryDate はカレンダーの「その日」を表す日付のみの値として扱う（時刻・タイムゾーンのブレを避けるため常にUTC 0時で保持）。
function parseDateOnly(value) {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayUTC() {
  return parseDateOnly(new Date().toISOString().slice(0, 10));
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
      orderBy: { entryDate: "desc" },
    });
    res.status(200).json({ diaryEntries });
    return;
  }

  if (req.method === "POST") {
    const { content, mood, entryDate: entryDateInput } = req.body ?? {};

    const entryDate = entryDateInput ? parseDateOnly(entryDateInput) : todayUTC();
    if (!entryDate) {
      res.status(400).json({ error: "日付の形式が正しくありません。" });
      return;
    }

    // イレギュラー「悪意」対策：未来の日付には継続日記を登録できないようにする。
    // （サーバーはUTCで日付判定するため、時差で「今日」がずれるユーザーのために1日分だけ許容する）
    if (entryDate.getTime() > todayUTC().getTime() + ONE_DAY_MS) {
      res.status(400).json({ error: "未来の日付には記録できません。" });
      return;
    }

    const trimmedContent = typeof content === "string" ? content.trim() : "";

    if (mood !== undefined && mood !== null && mood !== "" && !MOOD_VALUES.includes(mood)) {
      res.status(400).json({ error: "選択できないアイコンです。" });
      return;
    }
    const normalizedMood = mood || null;

    // イレギュラー「空っぽ」対策：文字がなくても、顔アイコンだけで記録できる。両方なければ拒否する。
    if (!trimmedContent && !normalizedMood) {
      res.status(400).json({ error: "日記の内容を入力するか、アイコンを選んでください。" });
      return;
    }

    if (trimmedContent) {
      const error = assertSafeFields({ 日記: { value: trimmedContent, maxLength: 1000 } });
      if (error) {
        res.status(400).json({ error });
        return;
      }
    }

    // イレギュラー「過剰」対策：1日につき1件までしか記録できないようにする。
    const existing = await prisma.diaryEntry.findUnique({
      where: { userHobbyId_entryDate: { userHobbyId: id, entryDate } },
    });
    if (existing) {
      res.status(409).json({ error: "その日はすでに記録済みです。1日1件までです。" });
      return;
    }

    await prisma.diaryEntry.create({
      data: { userHobbyId: id, entryDate, content: trimmedContent, mood: normalizedMood },
    });

    const entryCount = await prisma.diaryEntry.count({ where: { userHobbyId: id } });
    const newLevel = Math.min(MAX_CHARACTER_LEVEL, 1 + Math.floor(entryCount / ENTRIES_PER_LEVEL));

    const updated = await prisma.userHobby.update({
      where: { id },
      data: { characterLevel: newLevel },
      include: { hobby: true, diaryEntries: { orderBy: { entryDate: "desc" } } },
    });

    res.status(201).json({ userHobby: updated });
    return;
  }

  res.status(405).json({ error: "Method Not Allowed" });
}

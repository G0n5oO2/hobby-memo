import { prisma } from "./_lib/db.js";
import { requireUser } from "./_lib/session.js";
import { assertSafeFields, isExcessiveInterests } from "./_lib/validate.js";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const { gender, age, interests } = req.body ?? {};

  const error = assertSafeFields({
    性別: { value: gender, maxLength: 30 },
    興味: { value: interests, maxLength: 300 },
  });
  if (error) {
    res.status(400).json({ error });
    return;
  }

  let ageValue = null;
  if (age !== undefined && age !== null && age !== "") {
    ageValue = Number(age);
    if (!Number.isInteger(ageValue) || ageValue < 0 || ageValue > 120) {
      res.status(400).json({ error: "年齢は0〜120の範囲で入力してください。" });
      return;
    }
  }

  // イレギュラー2: 想定を大きく超える量の興味入力 → 診断で追加設問を挟むフラグを立てる
  const extendedQuiz = isExcessiveInterests(interests);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      gender: gender || null,
      age: ageValue,
      interests: interests || null,
      extendedQuiz,
      onboardingStep: "QUIZ",
    },
  });

  res.status(200).json({
    onboardingStep: updated.onboardingStep,
    extendedQuiz: updated.extendedQuiz,
    // イレギュラー5: 想定と異なる年齢層の場合は注意喚起フラグを返す（ブロックはしない）
    ageWarning:
      ageValue !== null && (ageValue < 17 || ageValue > 28)
        ? "このアプリは大学生年代向けに調整されています。入力内容によっては合う趣味が見つけにくい場合があります。"
        : null,
  });
}

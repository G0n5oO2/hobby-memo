-- 1. entryDate をいったんNULL許容で追加し、既存行は createdAt の日付で埋める
ALTER TABLE "DiaryEntry" ADD COLUMN "entryDate" DATE;
UPDATE "DiaryEntry" SET "entryDate" = ("createdAt" AT TIME ZONE 'UTC')::date;

-- 2. 同じ趣味・同じ日に複数記録されていた行は、一番古い1件だけ残す（1日1件制約に合わせるため）
DELETE FROM "DiaryEntry" a
USING "DiaryEntry" b
WHERE a."userHobbyId" = b."userHobbyId"
  AND a."entryDate" = b."entryDate"
  AND a."createdAt" > b."createdAt";

-- 3. NOT NULL化 + 1日1件のユニーク制約
ALTER TABLE "DiaryEntry" ALTER COLUMN "entryDate" SET NOT NULL;
CREATE UNIQUE INDEX "DiaryEntry_userHobbyId_entryDate_key" ON "DiaryEntry"("userHobbyId", "entryDate");

-- 4. 文字なしでも記録できるようにする mood（顔アイコン）カラム
ALTER TABLE "DiaryEntry" ADD COLUMN "mood" TEXT;

-- 5. content は空文字を許容（moodのみの記録に対応）
ALTER TABLE "DiaryEntry" ALTER COLUMN "content" SET DEFAULT '';

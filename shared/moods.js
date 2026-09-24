// 文字を書かなくても記録できるようにする顔アイコン。
// フロント（選択UI）とAPI（許可された値かのバリデーション）の両方から参照する共有定義。

export const MOOD_OPTIONS = [
  { value: "great", emoji: "😄", label: "最高" },
  { value: "good", emoji: "🙂", label: "まあまあ" },
  { value: "tired", emoji: "😴", label: "疲れた" },
  { value: "sad", emoji: "😢", label: "つらい" },
  { value: "angry", emoji: "😠", label: "いまいち" },
];

export const MOOD_VALUES = MOOD_OPTIONS.map((m) => m.value);

export function emojiForMood(mood) {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? null;
}

// イレギュラーケース3「悪意（変な文字列）」対策の共通バリデーション。
// スクリプト注入やSQL断片らしきパターン・制御文字・極端な長さの文字列を弾き、
// 検知した場合は次の画面へ進ませない（呼び出し側で400を返す）。

const DANGEROUS_PATTERNS = [
  /<\s*script/i,
  /<\s*\/\s*script/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["']/i, // onerror="..." のようなイベントハンドラ注入
  /--\s*$/, // SQLコメント
  /;\s*drop\s+table/i,
  /union\s+select/i,
  /\0/, // NULバイト
];

// 改行・タブ以外の制御文字を拒否
const CONTROL_CHARS_PATTERN = "[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]";
const CONTROL_CHARS = new RegExp(CONTROL_CHARS_PATTERN);

export function isSafeText(value, { maxLength = 500 } = {}) {
  if (typeof value !== "string") return true; // undefined/null は空扱いで別途チェック
  if (value.length > maxLength) return false;
  if (CONTROL_CHARS.test(value)) return false;
  return !DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

export function assertSafeFields(fields) {
  for (const [key, { value, maxLength }] of Object.entries(fields)) {
    if (!isSafeText(value, { maxLength })) {
      return `「${key}」に使用できない文字列、または長すぎる入力が含まれています。`;
    }
  }
  return null;
}

// イレギュラーケース2「過剰（想定の10倍）」の検知。
// 興味入力が想定を大きく超える量のとき true を返し、追加の絞り込み設問を挟む。
export function isExcessiveInterests(interests) {
  if (!interests) return false;
  const normalized = interests.trim();
  if (normalized.length === 0) return false;
  const tagCount = normalized.split(/[,、\s]+/).filter(Boolean).length;
  return normalized.length > 200 || tagCount > 15;
}

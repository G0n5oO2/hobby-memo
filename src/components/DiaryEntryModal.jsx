import { useState } from "react";
import { MOOD_OPTIONS, emojiForMood } from "../../shared/moods.js";

function formatDateKey(dateKey) {
  const [y, m, d] = dateKey.split("-");
  return `${y}/${Number(m)}/${Number(d)}`;
}

export default function DiaryEntryModal({ dateKey, entry, onClose, onSubmit, submitting, error }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);

  const isViewOnly = Boolean(entry);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ content, mood });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>{formatDateKey(dateKey)}</strong>
          <button type="button" className="btn-link" onClick={onClose}>
            閉じる
          </button>
        </div>

        {isViewOnly ? (
          <div>
            {emojiForMood(entry.mood) && (
              <div style={{ fontSize: "2rem" }}>{emojiForMood(entry.mood)}</div>
            )}
            {entry.content ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{entry.content}</p>
            ) : (
              <p className="subtitle">この日はアイコンだけで記録されています。</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="subtitle" style={{ marginTop: 0 }}>
              文字が思いつかない日は、アイコンを選ぶだけでも記録できます。
            </p>
            <div className="mood-picker">
              {MOOD_OPTIONS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  className={`mood-button${mood === m.value ? " selected" : ""}`}
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  aria-label={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日やったこと、感じたことを一言（任意）"
              maxLength={1000}
            />
            {error && <p className="error-text">{error}</p>}
            <button className="btn-primary" type="submit" disabled={submitting}>
              記録する
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

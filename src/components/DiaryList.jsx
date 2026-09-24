import { emojiForMood } from "../../shared/moods.js";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export default function DiaryList({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="subtitle">まだ日記がありません。カレンダーから今日の記録をつけてみよう。</p>;
  }

  return (
    <div>
      {entries.map((entry) => {
        const emoji = emojiForMood(entry.mood);
        return (
          <div className="diary-entry" key={entry.id}>
            <div className="diary-date">
              {formatDate(entry.entryDate)}
              {emoji && <span style={{ marginLeft: 6 }}>{emoji}</span>}
            </div>
            {entry.content && <div>{entry.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

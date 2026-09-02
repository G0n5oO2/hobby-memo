function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function DiaryList({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="subtitle">まだ日記がありません。今日の一言から始めてみよう。</p>;
  }

  return (
    <div>
      {entries.map((entry) => (
        <div className="diary-entry" key={entry.id}>
          <div className="diary-date">{formatDate(entry.createdAt)}</div>
          <div>{entry.content}</div>
        </div>
      ))}
    </div>
  );
}

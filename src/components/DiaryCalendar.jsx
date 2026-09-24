import { useMemo, useState } from "react";
import { emojiForMood } from "../../shared/moods.js";

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function DiaryCalendar({ entries, onSelectDate }) {
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const entryByDate = useMemo(() => {
    const map = new Map();
    for (const entry of entries ?? []) {
      // entryDate はUTC 0時で保存されているため、キー化にはUTCの年月日を使う（ローカルタイムゾーンでのズレを防ぐ）。
      const d = new Date(entry.entryDate);
      const key = toDateKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      map.set(key, entry);
    }
    return map;
  }, [entries]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return (
    <div className="diary-calendar">
      <div className="calendar-nav">
        <button
          type="button"
          className="btn-link"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          ＜ 前月
        </button>
        <strong>
          {year}年{month + 1}月
        </strong>
        <button
          type="button"
          className="btn-link"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          翌月 ＞
        </button>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="calendar-cell empty" />;

          const dateKey = toDateKey(year, month, day);
          const entry = entryByDate.get(dateKey);
          const isFuture = dateKey > todayKey;
          const isToday = dateKey === todayKey;
          const emoji = entry ? emojiForMood(entry.mood) : null;

          return (
            <button
              type="button"
              key={dateKey}
              className={`calendar-cell${isToday ? " today" : ""}${isFuture ? " future" : ""}${
                entry ? " has-entry" : ""
              }`}
              disabled={isFuture}
              onClick={() => onSelectDate(dateKey, entry ?? null)}
            >
              <span className="calendar-day-number">{day}</span>
              {/* イレギュラー「空っぽ」対策：記録が無い日には印を付けない */}
              {entry && <span className="calendar-mark">{emoji ?? "・"}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

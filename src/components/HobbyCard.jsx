const LEVEL_LABELS = { 1: "今日から気軽に", 2: "少し準備してから", 3: "じっくり型" };

export default function HobbyCard({ hobby, onSelect }) {
  return (
    <div className="hobby-card">
      <span className="level-badge">{LEVEL_LABELS[hobby.level] ?? `Lv.${hobby.level}`}</span>
      <h3>{hobby.name}</h3>
      <p>{hobby.description}</p>
      {onSelect && (
        <button className="btn-secondary" onClick={() => onSelect(hobby)}>
          これにする
        </button>
      )}
    </div>
  );
}

const STAGES = [
  { max: 2, emoji: "🥚", label: "たまご" },
  { max: 4, emoji: "🐣", label: "ひよこ" },
  { max: 6, emoji: "🐤", label: "こども" },
  { max: 8, emoji: "🐥", label: "せいちょう中" },
  { max: 10, emoji: "🦜", label: "一人前" },
];

function stageFor(level) {
  return STAGES.find((s) => level <= s.max) ?? STAGES[STAGES.length - 1];
}

export default function CharacterView({ characterName, characterLevel }) {
  const stage = stageFor(characterLevel);
  return (
    <div className="character-view">
      <div className="character-emoji">{stage.emoji}</div>
      <div>
        <strong>{characterName}</strong>（{stage.label}）
      </div>
      <div className="character-level">
        Lv.{characterLevel} ・ 日記を書くほど成長するよ
      </div>
    </div>
  );
}

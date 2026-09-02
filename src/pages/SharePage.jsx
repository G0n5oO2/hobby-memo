import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import CharacterView from "../components/CharacterView.jsx";
import DiaryList from "../components/DiaryList.jsx";

export default function SharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSharePage(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <div className="page">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="page-loading">読み込み中...</div>;

  return (
    <div className="page share-summary">
      <h1>{data.hobbyName} を続けています</h1>
      <p className="subtitle">
        {data.daysSinceStart}日目 ・ 日記 {data.diaryCount}件
      </p>
      <div className="card">
        <CharacterView characterName={data.characterName} characterLevel={data.characterLevel} />
      </div>
      <div className="card" style={{ textAlign: "left" }}>
        <p style={{ fontWeight: 600, marginTop: 0 }}>最近の記録</p>
        <DiaryList entries={data.recentDiaryEntries} />
      </div>
      <p className="subtitle">あなたも「趣味みつかる」で新しい一歩を探してみませんか？</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import CharacterView from "../components/CharacterView.jsx";
import DiaryList from "../components/DiaryList.jsx";

export default function DashboardPage() {
  const { refresh } = useAuth();
  const [userHobby, setUserHobby] = useState(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { userHobbies } = await api.listUserHobbies();
    setUserHobby(userHobbies[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddDiary(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const { userHobby: updated } = await api.addDiaryEntry(userHobby.id, content);
      setUserHobby(updated);
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare() {
    setError("");
    try {
      const { shareToken } = await api.createShareLink(userHobby.id);
      setShareUrl(`${window.location.origin}/share/${shareToken}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    await api.logout();
    await refresh();
  }

  if (loading) return <div className="page-loading">読み込み中...</div>;
  if (!userHobby) return <div className="page">趣味がまだ設定されていません。</div>;

  const daysSinceStart = Math.max(
    1,
    Math.ceil((Date.now() - new Date(userHobby.startedAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="page">
      <div className="top-bar">
        <h1 style={{ margin: 0 }}>{userHobby.hobby.name}</h1>
        <button className="btn-link" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
      <p className="subtitle">
        {daysSinceStart}日目 ・ 日記 {userHobby.diaryEntries.length}件
      </p>

      <div className="card">
        <CharacterView characterName={userHobby.characterName} characterLevel={userHobby.characterLevel} />
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, marginTop: 0 }}>今日の成長日記</p>
        <form onSubmit={handleAddDiary}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日やったこと、感じたことを一言"
            maxLength={1000}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            記録する
          </button>
        </form>
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, marginTop: 0 }}>これまでの記録</p>
        <DiaryList entries={userHobby.diaryEntries} />
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, marginTop: 0 }}>成果をシェア</p>
        <p className="subtitle">継続の様子を友達に共有して、次の一歩につなげよう。</p>
        <button className="btn-secondary" onClick={handleShare}>
          共有リンクを作成
        </button>
        {shareUrl && (
          <p style={{ wordBreak: "break-all", fontSize: "0.85rem", marginTop: 10 }}>{shareUrl}</p>
        )}
      </div>
    </div>
  );
}

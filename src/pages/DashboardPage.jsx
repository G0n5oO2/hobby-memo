import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import CharacterView from "../components/CharacterView.jsx";
import DiaryList from "../components/DiaryList.jsx";
import DiaryCalendar from "../components/DiaryCalendar.jsx";
import DiaryEntryModal from "../components/DiaryEntryModal.jsx";

export default function DashboardPage() {
  const { refresh } = useAuth();
  const [userHobby, setUserHobby] = useState(null);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { userHobbies } = await api.listUserHobbies();
    setUserHobby(userHobbies[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSelectDate(dateKey, entry) {
    setSelectedDate(dateKey);
    setSelectedEntry(entry);
    setModalError("");
  }

  function closeModal() {
    setSelectedDate(null);
    setSelectedEntry(null);
    setModalError("");
  }

  async function handleAddDiary({ content, mood }) {
    if (!content.trim() && !mood) {
      setModalError("内容を入力するか、アイコンを選んでください。");
      return;
    }
    setModalError("");
    setSubmitting(true);
    try {
      const { userHobby: updated } = await api.addDiaryEntry(userHobby.id, {
        content,
        mood,
        entryDate: selectedDate,
      });
      setUserHobby(updated);
      closeModal();
    } catch (err) {
      setModalError(err.message);
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
        <p style={{ fontWeight: 600, marginTop: 0 }}>継続カレンダー</p>
        <p className="subtitle">日付をタップして記録・見返しができます。つけ忘れた日も後から埋められます。</p>
        <DiaryCalendar entries={userHobby.diaryEntries} onSelectDate={handleSelectDate} />
      </div>

      {selectedDate && (
        <DiaryEntryModal
          key={selectedDate}
          dateKey={selectedDate}
          entry={selectedEntry}
          onClose={closeModal}
          onSubmit={handleAddDiary}
          submitting={submitting}
          error={modalError}
        />
      )}

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

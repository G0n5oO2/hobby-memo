import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import HobbyCard from "../components/HobbyCard.jsx";

const LEVEL_ORDER = [1, 2, 3];
const LEVEL_TITLES = { 1: "今日から気軽に", 2: "少し準備してから", 3: "じっくり型" };

export default function SuggestionsPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [byLevel, setByLevel] = useState(location.state?.suggestions ?? null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 中断からの復帰などで診断結果が無い場合は、始めやすい趣味のフォールバックを表示
  useEffect(() => {
    if (!byLevel) {
      api.searchHobbies("").then(({ hobbies }) => setByLevel({ 1: hobbies, 2: [], 3: [] }));
    }
  }, [byLevel]);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    try {
      const { hobbies } = await api.searchHobbies(query);
      setSearchResults(hobbies);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    if (!selectedHobby || !characterName.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await api.createUserHobby(selectedHobby.id, characterName.trim());
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (selectedHobby) {
    return (
      <div className="page">
        <h1>{selectedHobby.name}</h1>
        <p className="subtitle">一緒に続けるキャラクターに名前をつけましょう。</p>
        <div className="card">
          <form onSubmit={handleConfirm}>
            <label htmlFor="characterName">キャラクターの名前</label>
            <input
              id="characterName"
              type="text"
              maxLength={30}
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button className="btn-primary" type="submit" disabled={submitting}>
              この趣味を始める
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setSelectedHobby(null);
                setError("");
              }}
            >
              戻る
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="step-indicator">
        <span className="active" />
        <span className="active" />
        <span className="active" />
        <span />
      </div>
      <h1>あなたへのおすすめ</h1>
      <p className="subtitle">気になるものがなければ、キーワードで探すこともできます。</p>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="気になるワード（例：写真、資格）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">検索</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {searchResults ? (
        <div className="level-section">
          <h2>検索結果</h2>
          {searchResults.length === 0 && <p className="subtitle">見つかりませんでした。別のワードをお試しください。</p>}
          {searchResults.map((hobby) => (
            <HobbyCard key={hobby.id} hobby={hobby} onSelect={setSelectedHobby} />
          ))}
        </div>
      ) : (
        byLevel &&
        LEVEL_ORDER.map(
          (level) =>
            byLevel[level]?.length > 0 && (
              <div className="level-section" key={level}>
                <h2>{LEVEL_TITLES[level]}</h2>
                {byLevel[level].map((hobby) => (
                  <HobbyCard key={hobby.id} hobby={hobby} onSelect={setSelectedHobby} />
                ))}
              </div>
            )
        )
      )}
    </div>
  );
}

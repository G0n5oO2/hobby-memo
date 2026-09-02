import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

export default function ProfilePage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // イレギュラー5: 想定と異なる年齢層の場合に注意書きを表示（入力自体はブロックしない）
  const showAgeWarning = age !== "" && (Number(age) < 17 || Number(age) > 28);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api.saveProfile({ gender, age: age === "" ? null : age, interests });
      setWarning(result.ageWarning ?? "");
      await refresh();
      navigate("/quiz");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="step-indicator">
        <span className="active" />
        <span />
        <span />
        <span />
      </div>
      <h1>あなたについて教えてください</h1>
      <p className="subtitle">
        未入力のままでも大丈夫です。今すぐ始めやすい趣味をご提案します。
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="gender">性別（任意）</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">選択しない</option>
            <option value="女性">女性</option>
            <option value="男性">男性</option>
            <option value="その他">その他</option>
          </select>

          <label htmlFor="age">年齢（任意）</label>
          <input
            id="age"
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          {showAgeWarning && (
            <p className="warning-box">
              このアプリは大学生年代（17〜28歳ごろ）向けに調整されています。入力内容によっては合う趣味が見つけにくい場合があります。
            </p>
          )}

          <label htmlFor="interests">気になる内容（資格・制作など、自由記述・任意）</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="例：写真、資格、ものづくり、体を動かすこと..."
          />

          {error && <p className="error-text">{error}</p>}
          {warning && <p className="warning-box">{warning}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            次へ（軽い性格診断）
          </button>
        </form>
      </div>
    </div>
  );
}

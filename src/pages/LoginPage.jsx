import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

export default function LoginPage() {
  const { user, loading, refresh } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await api.login(email, password);
      } else {
        await api.register(email, password);
      }
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>趣味みつかる</h1>
      <p className="subtitle">
        休日、何をしたいか分からないあなたへ。診断から趣味を見つけて、続ける相棒キャラクターと一緒に記録しよう。
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">パスワード（8文字以上）</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {mode === "login" ? "ログイン" : "新規登録"}
          </button>
        </form>
        <button
          className="btn-link"
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "初めての方はこちら（新規登録）" : "アカウントをお持ちの方はこちら（ログイン）"}
        </button>
      </div>
    </div>
  );
}

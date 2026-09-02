import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { QUIZ_QUESTIONS, EXTENDED_QUIZ_QUESTIONS } from "../../shared/quizQuestions.js";

export default function QuizPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // イレギュラー2: プロフィール入力が想定を大きく超えていた場合、追加の絞り込み設問を出す
  const questions = user?.extendedQuiz
    ? [...QUIZ_QUESTIONS, ...EXTENDED_QUIZ_QUESTIONS]
    : QUIZ_QUESTIONS;

  const answeredCount = Object.keys(answers).length;

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const { suggestions } = await api.submitQuiz(answers);
      await refresh();
      navigate("/suggestions", { state: { suggestions } });
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
        <span className="active" />
        <span />
        <span />
      </div>
      <h1>軽い性格診断</h1>
      <p className="subtitle">
        直感で選んでOK。答えなかった設問はスキップしても提案されます。
        {user?.extendedQuiz && "（興味の入力が多かったので、より絞り込む設問を追加しています）"}
      </p>

      {questions.map((q) => (
        <div className="card" key={q.id}>
          <p style={{ fontWeight: 600, marginTop: 0 }}>{q.text}</p>
          <div className="option-group">
            {q.options.map((option, index) => (
              <button
                type="button"
                key={option.label}
                className={`option-button${answers[q.id] === index ? " selected" : ""}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: index }))}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="error-text">{error}</p>}
      <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
        {answeredCount === 0 ? "回答せずにおすすめを見る" : "この内容でおすすめを見る"}
      </button>
    </div>
  );
}

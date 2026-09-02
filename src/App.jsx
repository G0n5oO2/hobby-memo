import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SharePage from "./pages/SharePage.jsx";

// イレギュラー4「中断」対応：ログイン済みユーザーを onboardingStep に応じた
// 続きの画面へ自動的に戻す。
function homePathFor(user) {
  if (!user) return "/login";
  switch (user.onboardingStep) {
    case "PROFILE":
      return "/profile";
    case "QUIZ":
      return "/quiz";
    case "SUGGESTIONS":
      return "/suggestions";
    default:
      return "/dashboard";
  }
}

function StepRoute({ step, element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingStep !== step) return <Navigate to={homePathFor(user)} replace />;
  return element;
}

function DashboardRoute({ element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingStep !== "DONE") return <Navigate to={homePathFor(user)} replace />;
  return element;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={loading ? <div className="page-loading">読み込み中...</div> : <Navigate to={homePathFor(user)} replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<StepRoute step="PROFILE" element={<ProfilePage />} />} />
      <Route path="/quiz" element={<StepRoute step="QUIZ" element={<QuizPage />} />} />
      <Route path="/suggestions" element={<StepRoute step="SUGGESTIONS" element={<SuggestionsPage />} />} />
      <Route path="/dashboard" element={<DashboardRoute element={<DashboardPage />} />} />
      <Route path="/share/:token" element={<SharePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

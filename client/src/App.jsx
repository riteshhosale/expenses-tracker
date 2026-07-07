import { useEffect, useState } from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./context/useAuth.js";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { user, logout } = useAuth();
  const displayName = user?.name || "there";
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <span className="brand-icon">E</span>
          <div>
            <h1>Expense Tracker</h1>
            <p>Track, predict, and plan your spending</p>
          </div>
        </Link>

        <div className="header-actions">
          {user ? <span className="user-chip">Hi, {displayName}</span> : null}
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            <span className="toggle-icon" aria-hidden="true">
              {theme === "light" ? "☾" : "☀"}
            </span>
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
          <nav>
            <Link to="/">Dashboard</Link>
            {!user && <Link to="/login">Login</Link>}
            {!user && <Link to="/register">Register</Link>}
            {user && (
              <button className="linkish" onClick={logout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {user && (
          <section className="hero-banner">
            <div className="hero-copy">
              <p className="eyebrow">Personal finance workspace</p>
              <h2>Welcome back, {displayName}.</h2>
              <p>
                Add expenses, watch your prediction update, and keep your budget
                in control from one place.
              </p>
              <div className="hero-points">
                <span>Fast capture</span>
                <span>Budget pulse</span>
                <span>Smarter trends</span>
              </div>
            </div>
            <div className="hero-card">
              <span className="metric-icon hero-icon" aria-hidden="true">
                ⌂
              </span>
              <span>Budget cockpit</span>
              <strong>Live tracking</strong>
              <small>
                Budget meter, search filters, and spending insights.
              </small>
            </div>
          </section>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

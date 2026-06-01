import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      // error already captured in context
    }
  };

  return (
    <div className="auth-card auth-split">
      <div className="auth-copy">
        <span className="metric-icon auth-icon" aria-hidden="true">
          ⇢
        </span>
        <p className="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <p className="muted">
          Pick up where you left off and review your spending in seconds.
        </p>
        <div className="auth-features">
          <span>Secure sign in</span>
          <span>Saved theme</span>
          <span>Live analytics</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? "Signing in…" : "Login"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;

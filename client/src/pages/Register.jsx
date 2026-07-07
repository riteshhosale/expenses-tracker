import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    monthlyLimit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ ...form, monthlyLimit: Number(form.monthlyLimit) });
      navigate("/");
    } catch {
      // error is shown via context error state
    }
  };

  return (
    <div className="auth-card auth-split">
      <div className="auth-copy">
        <span className="metric-icon auth-icon" aria-hidden="true">
          ✦
        </span>
        <p className="eyebrow">Get started</p>
        <h2>Create account</h2>
        <p className="muted">
          Set a monthly limit and begin tracking every expense with context.
        </p>
        <div className="auth-features">
          <span>Budget limit</span>
          <span>Category tags</span>
          <span>Export CSV</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
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
        <label>
          Monthly Limit
          <input
            name="monthlyLimit"
            type="number"
            min="0"
            value={form.monthlyLimit}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? "Registering…" : "Register"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Register;

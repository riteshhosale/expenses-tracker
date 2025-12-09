import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../utils/api.js";

const ExpenseForm = ({ onAdded }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add expense");
      setForm({ title: "", amount: "", category: "", date: "" });
      onAdded?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <label>
        Title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Amount (INR)
        <input
          name="amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Category
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Date
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Add"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default ExpenseForm;

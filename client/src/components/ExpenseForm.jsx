import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../utils/api.js";
import { DEFAULT_CATEGORIES } from "../utils/categories.js";

const ExpenseForm = ({ onAdded }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
  });
  const [categoryMode, setCategoryMode] = useState("preset");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryModeChange = (e) => {
    const value = e.target.value;
    setCategoryMode(value);
    if (value === "preset") {
      setCustomCategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const category =
        categoryMode === "custom" ? customCategory.trim() : form.category;
      if (categoryMode === "custom" && !category) {
        throw new Error("Please enter a category name");
      }

      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          category,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add expense");
      setForm({ title: "", amount: "", category: "Food", date: "" });
      setCategoryMode("preset");
      setCustomCategory("");
      onAdded?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel form-card" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <span className="metric-icon form-icon" aria-hidden="true">
            +
          </span>
          <p className="eyebrow">Quick capture</p>
          <h3>Add Expense</h3>
        </div>
        <span className="panel-pill">Live</span>
      </div>
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
      <div className="category-block">
        <label className="category-control">
          <span className="field-label">Category</span>
          <select value={categoryMode} onChange={handleCategoryModeChange}>
            <option value="preset">Choose from list</option>
            <option value="custom">Custom category</option>
          </select>
        </label>
        {categoryMode === "preset" ? (
          <label className="category-control">
            <span className="field-label">Category option</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              {DEFAULT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="category-control">
            <span className="field-label">Custom category</span>
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type a category name"
              required
            />
          </label>
        )}
      </div>
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
      <button type="submit" disabled={loading} className="button-primary">
        {loading ? "Saving…" : "Add"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default ExpenseForm;

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { formatINR } from "../utils/currency.js";
import { API_BASE } from "../utils/api.js";
import { DEFAULT_CATEGORIES } from "../utils/categories.js";

const ExpenseList = ({ refreshToken }) => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load expenses");
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshToken]);

  const categories = useMemo(() => {
    const unique = new Set(
      expenses.map((expense) => expense.category || "Other"),
    );
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const search = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return expenses.filter((expense) => {
      const expenseDate = expense.date ? new Date(expense.date) : null;
      const matchesCategory =
        category === "all" || (expense.category || "Other") === category;
      const matchesQuery =
        !search ||
        expense.title?.toLowerCase().includes(search) ||
        (expense.category || "Other").toLowerCase().includes(search);
      const matchesStart = !start || !expenseDate || expenseDate >= start;
      const matchesEnd = !end || !expenseDate || expenseDate <= end;

      return matchesCategory && matchesQuery && matchesStart && matchesEnd;
    });
  }, [category, endDate, expenses, query, startDate]);

  const sortedExpenses = useMemo(() => {
    const items = [...filteredExpenses];
    const sorters = {
      newest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      highest: (a, b) => Number(b.amount || 0) - Number(a.amount || 0),
      lowest: (a, b) => Number(a.amount || 0) - Number(b.amount || 0),
      title: (a, b) => (a.title || "").localeCompare(b.title || ""),
    };

    return items.sort(sorters[sortBy] || sorters.newest);
  }, [filteredExpenses, sortBy]);

  const highestExpense = useMemo(() => {
    if (!sortedExpenses.length) return null;
    return [...sortedExpenses].sort(
      (a, b) => Number(b.amount || 0) - Number(a.amount || 0),
    )[0];
  }, [sortedExpenses]);

  const exportCsv = () => {
    const rows = [
      ["Title", "Category", "Amount", "Date"],
      ...sortedExpenses.map((expense) => [
        expense.title || "",
        expense.category || "",
        String(expense.amount ?? 0),
        expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const beginEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      title: expense.title || "",
      amount: String(expense.amount ?? ""),
      category: expense.category || "",
      date: expense.date
        ? new Date(expense.date).toISOString().slice(0, 10)
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const categoryOptions = useMemo(() => {
    const unique = new Set([
      ...DEFAULT_CATEGORIES,
      ...expenses.map((expense) => expense.category || "Other"),
    ]);

    return Array.from(unique).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
  }, [expenses]);

  const saveEdit = async (expenseId) => {
    if (!editForm) return;
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          amount: Number(editForm.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update expense");
      setExpenses((prev) =>
        prev.map((item) => (item._id === expenseId ? data : item)),
      );
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading expenses…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="panel list-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Activity feed</p>
          <h3>Recent expenses</h3>
        </div>
        <span className="panel-pill">{expenses.length}</span>
      </div>

      <div className="list-actions">
        <button
          className="button-ghost list-action"
          type="button"
          onClick={exportCsv}
          disabled={!sortedExpenses.length}
        >
          Export CSV
        </button>
        <span className="panel-pill">{sortedExpenses.length} shown</span>
      </div>

      <div className="filter-grid">
        <label className="filter-field">
          <span>Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title or category"
          />
        </label>

        <label className="filter-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label className="filter-field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>

      {sortedExpenses.length === 0 && (
        <div className="empty-state">
          <strong>
            {expenses.length === 0 ? "No expenses yet" : "No matching expenses"}
          </strong>
          <p className="muted">
            {expenses.length === 0
              ? "Add your first item to unlock the budget meter, chart, and projections."
              : "Try a broader search or switch the category filter to see more items."}
          </p>
        </div>
      )}

      {highestExpense && (
        <div className="list-highlight">
          <span className="metric-icon list-icon" aria-hidden="true">
            ↑
          </span>
          <div>
            <span>Largest item</span>
            <strong>
              {highestExpense.title} · {formatINR(highestExpense.amount)}
            </strong>
          </div>
        </div>
      )}
      {sortedExpenses.length > 0 && (
        <ul className="expenses">
          {sortedExpenses.map((exp) => (
            <li key={exp._id}>
              <div className="expense-topline">
                <div>
                  <span className="expense-icon" aria-hidden="true">
                    {exp.category?.[0] || "•"}
                  </span>
                  <strong>{exp.title}</strong>
                  <span className="category-chip">{exp.category}</span>
                </div>
                <span>{formatINR(exp.amount)}</span>
              </div>
              <div className="expense-meta">
                <span>{new Date(exp.date).toLocaleDateString()}</span>
              </div>
              {editingId === exp._id ? (
                <div className="edit-panel">
                  <label>
                    Title
                    <input
                      name="title"
                      value={editForm?.title || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    Amount (INR)
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      value={editForm?.amount || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    Category
                    <select
                      name="category"
                      value={editForm?.category || ""}
                      onChange={handleEditChange}
                    >
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Date
                    <input
                      name="date"
                      type="date"
                      value={editForm?.date || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <div className="action-row">
                    <button
                      type="button"
                      className="button-primary"
                      onClick={() => saveEdit(exp._id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="button-ghost"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="action-row">
                  <button
                    type="button"
                    onClick={() => beginEdit(exp)}
                    className="button-ghost"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(exp._id)}
                    className="button-ghost"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { formatINR } from "../utils/currency.js";
import { API_BASE } from "../utils/api.js";

const ExpenseList = ({ refreshToken }) => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
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
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshToken]);

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
    <div className="panel">
      <h3>Recent expenses</h3>
      {expenses.length === 0 && <p>No expenses yet.</p>}
      <ul className="expenses">
        {expenses.map((exp) => (
          <li key={exp._id}>
            <div>
              <strong>{exp.title}</strong> — {formatINR(exp.amount)} (
              {exp.category})
            </div>
            <div className="muted">
              {new Date(exp.date).toLocaleDateString()}
            </div>
            <button onClick={() => remove(exp._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;

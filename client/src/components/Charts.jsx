import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { formatINR } from "../utils/currency.js";
import { API_BASE } from "../utils/api.js";

const Charts = ({ refreshToken }) => {
  const { token, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [predicted, setPredicted] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [expenseRes, predictionRes] = await Promise.all([
          fetch(`${API_BASE}/api/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/expenses/predict`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const expenseData = await expenseRes.json();
        const predictionData = await predictionRes.json();

        if (!expenseRes.ok)
          throw new Error(expenseData.message || "Failed to load expenses");
        if (!predictionRes.ok)
          throw new Error(
            predictionData.message || "Failed to load prediction",
          );

        setExpenses(expenseData);
        setPredicted(predictionData.predicted);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token, refreshToken]);

  const categorySummary = useMemo(() => {
    const totals = expenses.reduce((acc, expense) => {
      const key = expense.category || "Other";
      acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [expenses]);

  const totalSpent = useMemo(
    () =>
      expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses],
  );

  const averageSpent = useMemo(
    () => (expenses.length ? totalSpent / expenses.length : 0),
    [expenses.length, totalSpent],
  );

  const budgetLimit = Number(user?.monthlyLimit || 0);
  const budgetRemaining = budgetLimit > 0 ? budgetLimit - totalSpent : null;
  const budgetUsed =
    budgetLimit > 0
      ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100))
      : 0;

  const topCategory = categorySummary[0];

  const maxAmount = Math.max(
    ...categorySummary.map((entry) => entry.amount),
    0,
  );

  return (
    <div className="panel prediction-card chart-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Forecast</p>
          <h3>Spending pulse</h3>
        </div>
        <span className="panel-pill">{expenses.length} items</span>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="insights-grid">
        <div className="insight-card">
          <span className="metric-icon" aria-hidden="true">
            ₹
          </span>
          <span>Total spent</span>
          <strong>{formatINR(totalSpent)}</strong>
        </div>
        <div className="insight-card">
          <span className="metric-icon" aria-hidden="true">
            ≈
          </span>
          <span>Average expense</span>
          <strong>{formatINR(averageSpent)}</strong>
        </div>
        <div className="insight-card">
          <span className="metric-icon" aria-hidden="true">
            ◆
          </span>
          <span>Top category</span>
          <strong>{topCategory ? topCategory.category : "—"}</strong>
        </div>
        <div className="insight-card accent-card">
          <span className="metric-icon" aria-hidden="true">
            ⌁
          </span>
          <span>Budget left</span>
          <strong>
            {budgetRemaining !== null
              ? formatINR(budgetRemaining)
              : "Set a limit"}
          </strong>
        </div>
      </div>

      {budgetLimit > 0 && (
        <div className="budget-meter" aria-label="Budget usage meter">
          <div className="budget-meter-topline">
            <span>Budget used</span>
            <strong>{budgetUsed}%</strong>
          </div>
          <div className="bar-track meter-track">
            <div
              className="bar-fill meter-fill"
              style={{ width: `${budgetUsed}%` }}
            />
          </div>
        </div>
      )}

      <div className="chart-summary">
        <div>
          <span className="summary-label">Total spent</span>
          <strong>{formatINR(totalSpent)}</strong>
        </div>
        <div>
          <span className="summary-label">Projected</span>
          <strong>{predicted !== null ? formatINR(predicted) : "—"}</strong>
        </div>
      </div>

      {categorySummary.length > 0 ? (
        <div className="bar-chart" aria-label="Category spending chart">
          {categorySummary.map((entry) => {
            const width =
              maxAmount > 0 ? Math.round((entry.amount / maxAmount) * 100) : 0;
            return (
              <div className="bar-row" key={entry.category}>
                <div className="bar-row-topline">
                  <span>{entry.category}</span>
                  <strong>{formatINR(entry.amount)}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      ["--bar-scale"]: width / 100,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state compact-state">
          <span className="metric-icon" aria-hidden="true">
            ◌
          </span>
          <strong>Chart waiting for data</strong>
          <p className="muted">
            Add a few expenses to see your category chart.
          </p>
        </div>
      )}

      {predicted !== null && (
        <p className="prediction-value">
          Next month outlook: {formatINR(predicted)}
        </p>
      )}
    </div>
  );
};

export default Charts;

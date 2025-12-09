import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { formatINR } from "../utils/currency.js";
import { API_BASE } from "../utils/api.js";

const Charts = () => {
  const { token } = useAuth();
  const [predicted, setPredicted] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/expenses/predict`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load prediction");
        setPredicted(data.predicted);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="panel">
      <h3>Prediction</h3>
      {error && <p className="error">{error}</p>}
      {predicted !== null ? (
        <p>Projected spending: {formatINR(predicted)}</p>
      ) : (
        <p className="muted">Prediction will appear after adding expenses.</p>
      )}
    </div>
  );
};

export default Charts;

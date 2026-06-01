import { useState } from "react";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Charts from "../components/Charts.jsx";

const Dashboard = () => {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="dashboard-layout">
      <section className="dashboard-intro panel panel-highlight">
        <div className="dashboard-intro-copy">
          <p className="eyebrow">Today’s overview</p>
          <h2>Keep spending visible, not scattered.</h2>
          <p className="muted">
            Add a cost, check the projection, and review recent activity in a
            layout that stays readable on desktop and mobile.
          </p>
          <div className="dashboard-tags">
            <span>Live entries</span>
            <span>Editable items</span>
            <span>Export ready</span>
          </div>
        </div>
        <div className="stats-row dashboard-stats">
          <div>
            <span>Capture</span>
            <strong>Fast entry</strong>
            <small>Save expenses in seconds.</small>
          </div>
          <div>
            <span>Track</span>
            <strong>Trend signal</strong>
            <small>See categories at a glance.</small>
          </div>
          <div>
            <span>Control</span>
            <strong>Budget focus</strong>
            <small>Stay under your monthly limit.</small>
          </div>
        </div>
      </section>

      <div className="grid">
        <div className="column">
          <ExpenseForm onAdded={() => setRefreshToken((v) => v + 1)} />
          <Charts refreshToken={refreshToken} />
        </div>
        <div className="column">
          <ExpenseList refreshToken={refreshToken} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

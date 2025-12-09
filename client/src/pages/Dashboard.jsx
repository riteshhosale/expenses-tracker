import { useState } from "react";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Charts from "../components/Charts.jsx";

const Dashboard = () => {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="grid">
      <div className="column">
        <ExpenseForm onAdded={() => setRefreshToken((v) => v + 1)} />
        <Charts />
      </div>
      <div className="column">
        <ExpenseList refreshToken={refreshToken} />
      </div>
    </div>
  );
};

export default Dashboard;

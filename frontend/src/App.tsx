import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [activePage, setActivePage] = useState("Dashboard");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage("Dashboard");
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  if (activePage === "Transactions") {
    return (
      <Transactions
        onLogout={handleLogout}
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );
  }

  if (activePage === "Budgets") {
    return (
      <Budgets
        onLogout={handleLogout}
        activePage={activePage}
        setActivePage={setActivePage}
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      activePage={activePage}
      setActivePage={setActivePage}
    />
  );
}

export default App;
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Investments from "./pages/Investments";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import AIAdvisor from "./pages/AIAdvisor";
import ImportStatement from "./pages/ImportStatement";
import { Toaster } from "react-hot-toast";


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

  if (activePage === "Goals") {
  return (
    <Goals
      onLogout={handleLogout}
      activePage={activePage}
      setActivePage={setActivePage}
    />
  );
}

  if (activePage === "Reports") {
  return (
    <Reports
      onLogout={handleLogout}
      activePage={activePage}
      setActivePage={setActivePage}
    />
  );
}

if (activePage === "AI Advisor") {
  return (
    <AIAdvisor
      onLogout={handleLogout}
      activePage={activePage}
      setActivePage={setActivePage}
    />
  );
}

if (activePage === "Import Statement") {
  return (
    <ImportStatement
      onLogout={handleLogout}
      activePage={activePage}
      setActivePage={setActivePage}
    />
  );
}

  if (activePage === "Investments") {
  return (
    <Investments
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
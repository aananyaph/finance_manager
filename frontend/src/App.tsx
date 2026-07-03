import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  return isLoggedIn ? (
    <Dashboard
      onLogout={() => setIsLoggedIn(false)}
    />
  ) : (
    <Login
      onLogin={() => setIsLoggedIn(true)}
    />
  );
}

export default App;
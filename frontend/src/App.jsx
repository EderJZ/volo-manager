import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Clients } from "./pages/Clients";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("volo_token"))
  );

  if (isAuthenticated) {
    return <Clients onLogout={() => setIsAuthenticated(false)} />;
  }

  return <Login onLogin={() => setIsAuthenticated(true)} />;
}

export default App;
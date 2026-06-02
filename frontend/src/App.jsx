import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Projects } from "./pages/Projects";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("volo_token"))
  );

  if (isAuthenticated) {
    return <Projects onLogout={() => setIsAuthenticated(false)} />;
  }

  return <Login onLogin={() => setIsAuthenticated(true)} />;
}

export default App;
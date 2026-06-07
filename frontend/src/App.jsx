import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ClientLayout } from "./components/ClientLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Clients } from "./pages/Clients";
import { ClientPortal } from "./pages/ClientPortal";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Projects } from "./pages/Projects";
import { Users } from "./pages/Users";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas do admin/editor/operator */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "editor", "operator"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/users" element={<Users />} />
      </Route>

      {/* Rotas do cliente */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/client-portal" element={<ClientPortal />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

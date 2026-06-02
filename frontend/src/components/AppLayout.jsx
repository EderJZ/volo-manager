import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/clients", label: "Clientes" },
  { path: "/projects", label: "Projetos" },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  return (
    <div>
      <aside>
        <h1>Volo Manager</h1>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "block",
                fontWeight: location.pathname === item.path ? "bold" : "normal",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <section>
        <Outlet />
      </section>
    </div>
  );
}

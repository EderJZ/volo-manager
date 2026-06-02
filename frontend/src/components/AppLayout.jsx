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
    <div className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-[#2a2a2a] bg-[#101010] px-6 py-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Volo
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-wide">Manager</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-4 py-3 text-sm uppercase tracking-[0.18em] transition ${
                  isActive
                    ? "bg-[#c8a13a] text-[#090909]"
                    : "text-[#9b988f] hover:bg-[#171717] hover:text-[#f5f1e8]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-[#3a3320] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#c8a13a] hover:text-[#090909]"
        >
          Sair
        </button>
      </aside>

      <section className="ml-72 min-h-screen px-10 py-8">
        <Outlet />
      </section>
    </div>
  );
}

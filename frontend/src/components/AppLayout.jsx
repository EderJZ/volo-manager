import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "⬡" },
  { path: "/clients", label: "Clientes", icon: "◇" },
  { path: "/projects", label: "Projetos", icon: "▷" },
  { path: "/users", label: "Usuários", icon: "◈" },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-[#2a2a2a] bg-[#0c0c0c] px-6 py-8">
        {/* Logo */}
        {/* Logo */}
        <div className="mb-10 border-b border-[#2a2a2a] pb-8">
          <Link to="/dashboard" className="group block">
            <p className="text-xs uppercase tracking-[0.45em] text-[#c8a13a] transition group-hover:text-[#e0bd55]">
              Volo Visual
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-widest text-[#f5f1e8] transition group-hover:text-[#c8a13a]">
              Manager
            </h1>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems
            .filter((item) => {
              if (item.path === "/users") return user?.role === "admin";
              return true;
            })
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-xs uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-[#c8a13a] bg-[#171717] text-[#c8a13a]"
                      : "border-transparent text-[#9b988f] hover:border-[#3a3320] hover:bg-[#131313] hover:text-[#f5f1e8]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Usuário + Sair */}
        <div className="border-t border-[#2a2a2a] pt-6">
          {user && (
            <div className="mb-4 px-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f6b63]">
                Logado como
              </p>
              <p className="mt-1 truncate text-sm text-[#d9d2c0]">
                {user.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-[#3a3320] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#c8a13a] transition hover:bg-[#c8a13a] hover:text-[#090909]"
          >
            Sair
          </button>
        </div>
      </aside>

      <section className="ml-64 min-h-screen px-10 py-8">
        <Outlet />
      </section>
    </div>
  );
}

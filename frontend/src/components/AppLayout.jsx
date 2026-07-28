import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "⬡" },
  { path: "/clients", label: "Clientes", icon: "◇" },
  { path: "/projects", label: "Projetos", icon: "▷" },
  { path: "/users", label: "Usuários", icon: "◈" },
];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(e.target)
      ) {
        setMobileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha o drawer mobile ao trocar de rota
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      {/* Header mobile (hambúrguer + logo) */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#2a2a2a] bg-[#0c0c0c] px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center border border-[#2a2a2a] text-[#c8a13a]"
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <Link to="/dashboard" className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c8a13a]">
            Volo Visual
          </p>
          <h1 className="-mt-0.5 text-sm font-semibold tracking-widest text-[#f5f1e8]">
            Manager
          </h1>
        </Link>
        {user ? (
          <div className="relative" ref={mobileDropdownRef}>
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="flex h-9 w-9 items-center justify-center border border-[#3a3320] bg-[#1a1500] text-xs font-semibold text-[#c8a13a]"
            >
              {getInitials(user.name)}
            </button>

            {mobileDropdownOpen && (
              <div className="fixed inset-x-4 top-16 z-50 border border-[#2a2a2a] bg-[#0c0c0c] shadow-xl">
                <div className="border-b border-[#2a2a2a] px-4 py-3">
                  <p className="text-sm font-semibold text-[#f5f1e8]">
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6f6b63]">{user.email}</p>
                </div>
                <div className="border-t border-[#2a2a2a] py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-red-400 transition hover:bg-red-950/30"
                  >
                    <span>→</span>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>

      {/* Overlay escuro atrás do drawer (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#2a2a2a] bg-[#0c0c0c] px-6 py-8 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Botão fechar (só mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-[#9b988f] lg:hidden"
          aria-label="Fechar menu"
        >
          ✕
        </button>

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
          {/* Sair visível direto no drawer mobile */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-1 py-2 text-xs uppercase tracking-wider text-red-400 transition hover:text-red-300 lg:hidden"
          >
            <span>→</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Área de conteúdo */}
      <div className="min-h-screen relative pt-16 lg:ml-64 lg:pt-0">
        {/* Avatar fixo no canto superior direito (somente desktop) */}
        {user && (
          <div
            className="absolute right-4 top-8 z-30 hidden lg:block lg:right-10"
            ref={dropdownRef}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center border border-[#3a3320] bg-[#1a1500] text-sm font-semibold text-[#c8a13a]">
                {getInitials(user.name)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#f5f1e8]">
                  {user.name}
                </p>
                <p className="text-xs text-[#6f6b63]">{user.role}</p>
              </div>
              <span className="text-xs text-[#6f6b63]">
                {dropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 border border-[#2a2a2a] bg-[#0c0c0c] shadow-xl">
                <div className="border-b border-[#2a2a2a] px-4 py-3">
                  <p className="text-sm font-semibold text-[#f5f1e8]">
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6f6b63]">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    disabled
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#4a4a4a] cursor-not-allowed"
                  >
                    <span>✎</span>
                    Editar perfil
                    <span className="ml-auto text-[10px] text-[#3a3a3a]">
                      em breve
                    </span>
                  </button>
                  <button
                    disabled
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#4a4a4a] cursor-not-allowed"
                  >
                    <span>⇄</span>
                    Trocar usuário
                    <span className="ml-auto text-[10px] text-[#3a3a3a]">
                      em breve
                    </span>
                  </button>
                </div>
                <div className="border-t border-[#2a2a2a] py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-red-400 transition hover:bg-red-950/30"
                  >
                    <span>→</span>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da página */}
        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

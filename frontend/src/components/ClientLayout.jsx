import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClientLayout() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const dropdownRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifProjects, setNotifProjects] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    api
      .get("/client-portal/me")
      .then((res) => setClient(res.data))
      .catch(() => {});

    api
      .get("/client-portal/my-projects")
      .then((res) => {
        const unread = res.data.filter((p) => p.has_client_update);
        setNotifications(unread.length);
        setNotifProjects(unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    try {
      await api.put("/client-portal/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess("Senha alterada com sucesso!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setPasswordError(
        typeof detail === "string" ? detail : "Erro ao alterar senha.",
      );
    }
  }

  function closeProfileModal() {
    setProfileModal(false);
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      {/* Modal de alterar senha */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeProfileModal}
          />
          <div className="relative w-full max-w-sm border border-[#2a2a2a] bg-[#101010] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
              Perfil
            </p>
            <h3 className="mt-2 text-xl font-semibold">Alterar senha</h3>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#6f6b63]">
                  Senha atual
                </label>
                <input
                  type="password"
                  className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-sm text-[#f5f1e8] outline-none focus:border-[#c8a13a]"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      current_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#6f6b63]">
                  Nova senha
                </label>
                <input
                  type="password"
                  className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-sm text-[#f5f1e8] outline-none focus:border-[#c8a13a]"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#6f6b63]">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-sm text-[#f5f1e8] outline-none focus:border-[#c8a13a]"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-400">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-[#5ce07a]">{passwordSuccess}</p>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 bg-[#c8a13a] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#090909] transition hover:bg-[#e0bd55]"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={closeProfileModal}
                  className="flex-1 border border-[#2a2a2a] px-4 py-3 text-xs uppercase tracking-wider text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0c0c0c] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c8a13a] sm:text-xs sm:tracking-[0.45em]">
              Volo Visual
            </p>
            <h1 className="mt-1 truncate text-sm font-semibold tracking-wide text-[#f5f1e8] sm:text-lg sm:tracking-widest">
              Portal do Cliente
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Sino */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-[#9b988f] transition hover:text-[#c8a13a]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-[#c8a13a] text-[9px] font-bold text-[#090909]">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Dropdown de notificações */}
              {notifOpen && (
                <div className="fixed inset-x-4 top-16 z-50 border border-[#2a2a2a] bg-[#0c0c0c] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-72">
                  <div className="border-b border-[#2a2a2a] px-4 py-3">
                    <p className="text-xs uppercase tracking-wider text-[#6f6b63]">
                      Notificações
                    </p>
                  </div>

                  {notifProjects.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-[#4a4a4a]">
                        Nenhuma notificação
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifProjects.map((project) => (
                        <div
                          key={project.id}
                          className="border-b border-[#1a1a1a] px-4 py-3 last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8a13a]" />
                            <div>
                              <p className="text-xs font-semibold text-[#d9d2c0]">
                                {project.title}
                              </p>
                              <p className="mt-0.5 text-xs text-[#9b988f]">
                                Houve alterações no andamento do seu projeto.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar + dropdown */}
            {client && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 transition hover:opacity-80 sm:gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#3a3320] bg-[#1a1500] text-sm font-semibold text-[#c8a13a]">
                    {getInitials(client.name)}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-[#f5f1e8]">
                      {client.name}
                    </p>
                    {client.company && (
                      <p className="text-xs text-[#6f6b63]">{client.company}</p>
                    )}
                  </div>
                  <span className="hidden text-xs text-[#6f6b63] sm:inline">
                    {dropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="fixed inset-x-4 top-16 z-50 border border-[#2a2a2a] bg-[#0c0c0c] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-52">
                    <div className="border-b border-[#2a2a2a] px-4 py-3">
                      <p className="text-sm font-semibold text-[#f5f1e8]">
                        {client.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6f6b63]">
                        {client.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setProfileModal(true);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#9b988f] transition hover:bg-[#171717] hover:text-[#c8a13a]"
                      >
                        ✎ Alterar senha
                      </button>
                    </div>
                    <div className="border-t border-[#2a2a2a] py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-red-400 transition hover:bg-red-950/30"
                      >
                        → Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Outlet context={{ setNotifications }} />
      </main>
    </div>
  );
}

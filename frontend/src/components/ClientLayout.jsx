import { Outlet, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useEffect, useState } from "react";

export function ClientLayout() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);

  useEffect(() => {
    api
      .get("/client-portal/me")
      .then((res) => setClient(res.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0c0c0c] px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-[#c8a13a]">
              Volo Visual
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-widest text-[#f5f1e8]">
              Portal do Cliente
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {client && (
              <div className="text-right">
                <p className="text-sm font-semibold text-[#f5f1e8]">
                  {client.name}
                </p>
                {client.company && (
                  <p className="text-xs text-[#9b988f]">{client.company}</p>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-widest text-[#c8a13a] transition hover:bg-[#c8a13a] hover:text-[#090909]"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}

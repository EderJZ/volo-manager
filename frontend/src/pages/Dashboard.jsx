import { useEffect, useState } from "react";
import { api } from "../services/api";

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      setError("Não foi possível carregar o dashboard.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <main>
        <p>{error}</p>
        <button onClick={handleLogout}>Sair</button>
      </main>
    );
  }

  if (!summary) {
    return <main>Carregando dashboard...</main>;
  }

  return (
    <main>
      <header className="mb-10 flex items-end justify-between border-b border-[#2a2a2a] pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Visão geral
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-wide">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
            Resumo operacional dos clientes, projetos e orçamentos em andamento.
          </p>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="border border-[#2a2a2a] bg-[#101010] p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Clientes
          </span>
          <strong className="mt-4 block text-4xl font-semibold text-[#f5f1e8]">
            {summary.total_clients}
          </strong>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Projetos
          </span>
          <strong className="mt-4 block text-4xl font-semibold text-[#f5f1e8]">
            {summary.total_projects}
          </strong>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Orçamento total
          </span>
          <strong className="mt-4 block text-3xl font-semibold text-[#c8a13a]">
            {summary.total_budget.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
        </article>
      </section>

      <section className="mt-8 border border-[#2a2a2a] bg-[#101010] p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
            Pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Projetos por status</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(summary.projects_by_status).map(([status, total]) => (
            <div
              key={status}
              className="flex items-center justify-between border border-[#2a2a2a] bg-[#171717] px-4 py-3"
            >
              <span className="text-sm capitalize text-[#d9d2c0]">
                {status.replace("_", " ")}
              </span>
              <strong className="text-[#c8a13a]">{total}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

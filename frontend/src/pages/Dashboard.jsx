import { useEffect, useState } from "react";
import { api } from "../services/api";

const STATUS_LABELS = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  pre_producao: "Pré-produção",
  gravando: "Gravando",
  edicao: "Edição",
  em_edicao: "Em edição",
  revisao: "Revisão",
  entregue: "Entregue",
};

const STATUS_COLORS = {
  orcamento: "#9b988f",
  aprovado: "#c8a13a",
  pre_producao: "#a89060",
  gravando: "#e05c5c",
  edicao: "#5c9be0",
  em_edicao: "#5c9be0",
  revisao: "#9b5ce0",
  entregue: "#5ce07a",
};

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status.replace(/_/g, " ");
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || "#c8a13a";
}

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
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#9b988f]">{error}</p>
        <button
          onClick={loadDashboard}
          className="border border-[#2a2a2a] px-6 py-2 text-xs uppercase tracking-widest text-[#c8a13a] transition hover:border-[#c8a13a]"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#c8a13a]" />
        <p className="text-xs uppercase tracking-widest text-[#9b988f]">
          Carregando
        </p>
      </main>
    );
  }

  const totalProjetos = summary.total_projects || 1;
  const ticketMedio =
    summary.total_projects > 0
      ? summary.total_budget / summary.total_projects
      : 0;

  const statusEntries = Object.entries(summary.projects_by_status);

  return (
    <main>
      {/* Cabeçalho */}
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
        <button
          onClick={loadDashboard}
          className="border border-[#2a2a2a] px-5 py-2 text-xs uppercase tracking-widest text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
        >
          Atualizar
        </button>
      </header>

      {/* Cards principais */}
      <section className="grid gap-5 md:grid-cols-4">
        <article className="border border-[#2a2a2a] bg-[#101010] p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Clientes
          </span>
          <strong className="mt-4 block text-4xl font-semibold text-[#f5f1e8]">
            {summary.total_clients}
          </strong>
          <p className="mt-2 text-xs text-[#9b988f]">cadastrados</p>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Projetos
          </span>
          <strong className="mt-4 block text-4xl font-semibold text-[#f5f1e8]">
            {summary.total_projects}
          </strong>
          <p className="mt-2 text-xs text-[#9b988f]">no total</p>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-6 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Orçamento total
          </span>
          <strong className="mt-4 block text-3xl font-semibold text-[#c8a13a]">
            {summary.total_budget.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
          <p className="mt-2 text-xs text-[#9b988f]">
            Ticket médio:{" "}
            <span className="text-[#d9d2c0]">
              {ticketMedio.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
        </article>
      </section>

      {/* Pipeline */}
      <section className="mt-6 border border-[#2a2a2a] bg-[#101010] p-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
              Pipeline
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Projetos por status</h2>
          </div>
          <span className="text-xs text-[#9b988f]">
            {summary.total_projects} projetos no total
          </span>
        </div>

        <div className="space-y-3">
          {statusEntries.map(([status, total]) => {
            const porcentagem = Math.round((total / totalProjetos) * 100);
            const cor = getStatusColor(status);
            return (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                    <span className="text-sm text-[#d9d2c0]">
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9b988f]">
                      {porcentagem}%
                    </span>
                    <strong className="w-4 text-right text-sm text-[#c8a13a]">
                      {total}
                    </strong>
                  </div>
                </div>
                <div className="h-1 w-full bg-[#1a1a1a]">
                  <div
                    className="h-1 transition-all duration-500"
                    style={{ width: `${porcentagem}%`, backgroundColor: cor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

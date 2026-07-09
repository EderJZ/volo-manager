import { useEffect, useState } from "react";
import { api } from "../services/api";

const STATUS_LABELS = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  pre_producao: "Pré-produção",
  gravando: "Gravando",
  em_edicao: "Em edição",
  revisao: "Revisão",
  concluido: "Concluído",
  cancelado: "Cancelado",
  arquivado: "Arquivado",
};

const STATUS_COLORS = {
  orcamento: "#9b988f",
  aprovado: "#c8a13a",
  pre_producao: "#a89060",
  gravando: "#e05c5c",
  em_edicao: "#5c9be0",
  revisao: "#9b5ce0",
  concluido: "#5ce07a",
  cancelado: "#e05c5c",
  arquivado: "#6f6b63",
};

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status.replace(/_/g, " ");
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || "#c8a13a";
}

function formatDate(dateStr) {
  if (!dateStr) return "Sem prazo";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function getDeadlineAlert(deadlineStr) {
  if (!deadlineStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr + "T00:00:00");
  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Prazo vencido", color: "#e05c5c" };
  if (diffDays === 0) return { label: "Vence hoje", color: "#e0a05c" };
  if (diffDays <= 3)
    return { label: `Vence em ${diffDays}d`, color: "#e0a05c" };
  return null;
}

// ─── Gráfico de barras simples ────────────────────────────────
function BarChart({ data, color, label }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-[#4a4a4a]">Sem dados disponíveis</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#6f6b63]">
        {label}
      </p>
      <div className="flex items-end gap-3 h-40">
        {data.map((item, i) => {
          const height = Math.round((item.value / maxValue) * 100);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] text-[#6f6b63]">
                {item.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </span>
              <div className="w-full relative" style={{ height: "100px" }}>
                <div
                  className="absolute bottom-0 w-full transition-all duration-700"
                  style={{ height: `${height}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[10px] text-[#6f6b63]">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch {
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
      <header className="mb-8 flex items-end justify-between border-b border-[#2a2a2a] pb-8">
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

      {/* Tabs */}
      <div className="mt-8 flex border-b border-[#2a2a2a]">
        {[
          { key: "overview", label: "Pipeline" },
          { key: "financial", label: "Financeiro" },
          {
            key: "active",
            label: `Em andamento (${summary.active_projects?.length || 0})`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-xs uppercase tracking-wider transition ${
              tab === t.key
                ? "border-b-2 border-[#c8a13a] text-[#c8a13a]"
                : "text-[#6f6b63] hover:text-[#9b988f]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Pipeline */}
      {tab === "overview" && (
        <section className="mt-6 border border-[#2a2a2a] bg-[#101010] p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
                Pipeline
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Projetos por status
              </h2>
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
      )}

      {/* Tab: Financeiro */}
      {tab === "financial" && (
        <section className="mt-6 space-y-6">
          {/* Cards financeiros */}
          <div className="grid gap-5 md:grid-cols-2">
            <article className="border border-[#2a2a2a] bg-[#101010] p-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
                Total orçado
              </span>
              <strong className="mt-4 block text-3xl font-semibold text-[#c8a13a]">
                {summary.total_budget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
              <p className="mt-2 text-xs text-[#9b988f]">todos os projetos</p>
            </article>

            <article className="border border-[#2a2a2a] bg-[#101010] p-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
                Receita concluída
              </span>
              <strong className="mt-4 block text-3xl font-semibold text-[#5ce07a]">
                {summary.completed_budget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
              <p className="mt-2 text-xs text-[#9b988f]">projetos concluídos</p>
            </article>
          </div>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-[#2a2a2a] bg-[#101010] p-6">
              <BarChart
                data={summary.monthly_budget}
                color="#c8a13a"
                label="Orçamento por mês"
              />
            </div>
            <div className="border border-[#2a2a2a] bg-[#101010] p-6">
              <BarChart
                data={summary.monthly_completed}
                color="#5ce07a"
                label="Receita concluída por mês"
              />
            </div>
          </div>
        </section>
      )}

      {/* Tab: Em andamento */}
      {tab === "active" && (
        <section className="mt-6 grid gap-4">
          {summary.active_projects?.length === 0 && (
            <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-[#9b988f]">
                Nenhum projeto em andamento
              </p>
            </div>
          )}

          {summary.active_projects?.map((project) => {
            const color = getStatusColor(project.status);
            const deadlineAlert = getDeadlineAlert(project.deadline);

            return (
              <article
                key={project.id}
                className="border border-[#2a2a2a] bg-[#101010] p-6 transition hover:border-[#4a422d]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-[#f5f1e8]">
                        {project.title}
                      </h2>
                      <span
                        className="border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                        style={{ color, borderColor: color + "50" }}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#9b988f]">
                      {project.client_name}
                    </p>

                    {project.current_phase_description && (
                      <div className="mt-3 border-l-2 border-[#2a2a2a] pl-3">
                        <p className="text-xs uppercase tracking-wider text-[#6f6b63]">
                          O que está sendo feito
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-[#9b988f]">
                          {project.current_phase_description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[#6f6b63]">Prazo</p>
                    <p className="mt-1 text-sm text-[#d9d2c0]">
                      {formatDate(project.deadline)}
                    </p>
                    {deadlineAlert && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: deadlineAlert.color }}
                      >
                        {deadlineAlert.label}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

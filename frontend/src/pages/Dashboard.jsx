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

// ─── Gráfico de linha com gradiente ──────────────────────────
function LineChart({ data, color, label }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-[#4a4a4a]">Sem dados disponíveis</p>
      </div>
    );
  }

  // Caso especial: apenas um ponto
  if (data.length === 1) {
    return (
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#6f6b63]">
          {label}
        </p>
        <div className="flex h-40 flex-col items-center justify-center gap-2 border border-dashed border-[#2a2a2a]">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <p className="text-xs text-[#6f6b63]">{data[0].month}</p>
          <p className="text-sm font-semibold" style={{ color }}>
            {data[0].value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>
    );
  }

  const width = 500;
  const height = 160;
  const paddingX = 16;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => ({
    x: paddingX + (i / (data.length - 1 || 1)) * chartWidth,
    y: paddingY + chartHeight - (d.value / maxValue) * chartHeight,
    value: d.value,
    month: d.month,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const gradientId = `gradient-${label.replace(/\s/g, "")}`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: paddingY + chartHeight * ratio,
  }));

  return (
    <div>
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#6f6b63]">
        {label}
      </p>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: "160px" }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((line, i) => (
            <line
              key={i}
              x1={paddingX}
              y1={line.y}
              x2={width - paddingX}
              y2={line.y}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          ))}

          <path d={areaD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={color} />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                onMouseEnter={() =>
                  setTooltip({ x: p.x, y: p.y, value: p.value, month: p.month })
                }
              />
            </g>
          ))}

          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height}
              textAnchor="middle"
              fill="#4a4a4a"
              fontSize="10"
            >
              {p.month}
            </text>
          ))}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute border border-[#2a2a2a] bg-[#0c0c0c] px-3 py-2 text-xs shadow-xl z-10"
            style={{
              left: `${(tooltip.x / width) * 100}%`,
              top: `${(tooltip.y / height) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <p className="text-[#6f6b63]">{tooltip.month}</p>
            <p className="font-semibold" style={{ color }}>
              {tooltip.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lista de projetos por status ─────────────────────────────
function ProjectsByStatus({ projects, onClose, statusLabel, color }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <p className="text-sm font-semibold text-[#d9d2c0]">{statusLabel}</p>
          <span className="text-xs text-[#6f6b63]">
            — {projects.length} projeto(s)
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-[#6f6b63] hover:text-[#c8a13a]"
        >
          ✕ fechar
        </button>
      </div>

      {projects.map((project) => {
        const deadlineAlert = getDeadlineAlert(project.deadline);
        return (
          <div
            key={project.id}
            className="border border-[#2a2a2a] bg-[#0c0c0c] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#f5f1e8]">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs text-[#9b988f]">
                  {project.client_name}
                </p>
                {project.current_phase_description && (
                  <div className="mt-2 border-l-2 border-[#2a2a2a] pl-3">
                    <p className="text-xs text-[#6f6b63]">
                      O que está sendo feito
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#9b988f]">
                      {project.current_phase_description}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:shrink-0 sm:text-right">
                <p className="text-xs text-[#6f6b63]">Prazo</p>
                <div className="flex items-center gap-2 sm:mt-1 sm:block">
                  <p className="text-xs text-[#d9d2c0]">
                    {formatDate(project.deadline)}
                  </p>
                  {deadlineAlert && (
                    <p
                      className="text-[10px] sm:mt-1"
                      style={{ color: deadlineAlert.color }}
                    >
                      {deadlineAlert.label}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────
export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [finishedProjects, setFinishedProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  async function loadDashboard() {
    try {
      const [summaryRes, projectsRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/projects/"),
      ]);
      setSummary(summaryRes.data);
      setFinishedProjects(
        projectsRes.data.filter((p) =>
          ["concluido", "cancelado", "arquivado"].includes(p.status),
        ),
      );
    } catch {
      setError("Não foi possível carregar o dashboard.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
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

  const projectsBySelectedStatus = selectedStatus
    ? summary.active_projects?.filter((p) => p.status === selectedStatus) || []
    : [];

  return (
    <main>
      {/* Cabeçalho */}
      <header className="mb-6 flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Visão geral
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-wide sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
            Resumo operacional dos clientes, projetos e orçamentos em andamento.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="self-start border border-[#2a2a2a] px-5 py-2 text-xs uppercase tracking-widest text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a] sm:self-auto"
        >
          Atualizar
        </button>
      </header>

      {/* Cards principais */}
      <section className="grid gap-4 sm:gap-5 md:grid-cols-4">
        <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Clientes
          </span>
          <strong className="mt-4 block text-3xl font-semibold text-[#f5f1e8] sm:text-4xl">
            {summary.total_clients}
          </strong>
          <p className="mt-2 text-xs text-[#9b988f]">cadastrados</p>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Projetos
          </span>
          <strong className="mt-4 block text-3xl font-semibold text-[#f5f1e8] sm:text-4xl">
            {summary.total_projects}
          </strong>
          <p className="mt-2 text-xs text-[#9b988f]">no total</p>
        </article>

        <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
            Orçamento total
          </span>
          <strong className="mt-4 block text-2xl font-semibold text-[#c8a13a] sm:text-3xl">
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
      <div className="mt-8 overflow-x-auto border-b border-[#2a2a2a]">
        <div className="flex w-max min-w-full">
          {[
            { key: "overview", label: "Pipeline" },
            { key: "financial", label: "Financeiro" },
            {
              key: "finished",
              label: `Finalizados (${finishedProjects.length})`,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedStatus(null);
              }}
              className={`shrink-0 whitespace-nowrap px-4 py-3 text-xs uppercase tracking-wider transition sm:px-6 ${
                tab === t.key
                  ? "border-b-2 border-[#c8a13a] text-[#c8a13a]"
                  : "text-[#6f6b63] hover:text-[#9b988f]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Pipeline */}
      {tab === "overview" && (
        <section className="mt-6 border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
                Pipeline
              </p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
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
              const isSelected = selectedStatus === status;
              const hasActiveProjects = summary.active_projects?.some(
                (p) => p.status === status,
              );

              return (
                <div key={status}>
                  <div
                    className={`mb-1 flex items-center justify-between rounded transition ${hasActiveProjects ? "cursor-pointer hover:bg-[#171717] px-2 py-1 -mx-2" : ""}`}
                    onClick={() => {
                      if (!hasActiveProjects) return;
                      setSelectedStatus(isSelected ? null : status);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cor }}
                      />
                      <span className="text-sm text-[#d9d2c0]">
                        {getStatusLabel(status)}
                      </span>
                      {hasActiveProjects && (
                        <span className="text-[10px] text-[#6f6b63]">
                          {isSelected ? "▲" : "▼"}
                        </span>
                      )}
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

                  {/* Lista de projetos do status */}
                  {isSelected && (
                    <ProjectsByStatus
                      projects={projectsBySelectedStatus}
                      onClose={() => setSelectedStatus(null)}
                      statusLabel={getStatusLabel(status)}
                      color={cor}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab: Financeiro */}
      {tab === "financial" && (
        <section className="mt-6 space-y-5">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
                Total orçado
              </span>
              <strong className="mt-4 block text-xl font-semibold text-[#c8a13a] sm:text-2xl">
                {summary.total_budget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
              <p className="mt-2 text-xs text-[#9b988f]">todos os projetos</p>
            </article>

            <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
                Receita concluída
              </span>
              <strong className="mt-4 block text-xl font-semibold text-[#5ce07a] sm:text-2xl">
                {summary.completed_budget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
              <p className="mt-2 text-xs text-[#9b988f]">projetos concluídos</p>
            </article>

            <article className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9b988f]">
                Taxa de conclusão
              </span>
              <strong className="mt-4 block text-xl font-semibold text-[#f5f1e8] sm:text-2xl">
                {summary.total_budget > 0
                  ? Math.round(
                      (summary.completed_budget / summary.total_budget) * 100,
                    )
                  : 0}
                %
              </strong>
              <p className="mt-2 text-xs text-[#9b988f]">do total orçado</p>
            </article>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <div className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
              <LineChart
                data={summary.monthly_budget}
                color="#c8a13a"
                label="Orçamento por mês"
              />
            </div>
            <div className="border border-[#2a2a2a] bg-[#101010] p-4 sm:p-6">
              <LineChart
                data={summary.monthly_completed}
                color="#5ce07a"
                label="Receita concluída por mês"
              />
            </div>
          </div>
        </section>
      )}

      {/* Tab: Finalizados */}
      {tab === "finished" && (
        <section className="mt-6 grid gap-4">
          {finishedProjects.length === 0 && (
            <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-[#9b988f]">
                Nenhum projeto finalizado
              </p>
            </div>
          )}

          {finishedProjects.map((project) => {
            const color = getStatusColor(project.status);
            return (
              <article
                key={project.id}
                className="border border-[#2a2a2a] bg-[#101010] p-4 opacity-80 transition hover:opacity-100 hover:border-[#4a422d] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h2 className="text-base font-semibold text-[#f5f1e8]">
                        {project.title}
                      </h2>
                      <span
                        className="border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                        style={{ color, borderColor: color + "50" }}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="mt-1 text-xs text-[#9b988f]">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:block sm:shrink-0 sm:text-right">
                    {project.budget > 0 && (
                      <p className="text-sm font-semibold text-[#c8a13a]">
                        {Number(project.budget).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    )}
                    {project.deadline && (
                      <p className="text-xs text-[#6f6b63] sm:mt-1">
                        Prazo: {formatDate(project.deadline)}
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

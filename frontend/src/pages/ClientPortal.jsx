import { useEffect, useState } from "react";
import { api } from "../services/api";

const STATUS_ORDER = [
  "orcamento",
  "aprovado",
  "pre_producao",
  "gravando",
  "em_edicao",
  "revisao",
  "entregue",
];

const STATUS_LABELS = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  pre_producao: "Pré-produção",
  gravando: "Gravando",
  em_edicao: "Em edição",
  revisao: "Revisão",
  entregue: "Entregue",
};

const STATUS_COLORS = {
  orcamento: "#9b988f",
  aprovado: "#c8a13a",
  pre_producao: "#a89060",
  gravando: "#e05c5c",
  em_edicao: "#5c9be0",
  revisao: "#9b5ce0",
  entregue: "#5ce07a",
};

function getProgress(status) {
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STATUS_ORDER.length) * 100);
}

function formatDate(dateStr) {
  if (!dateStr) return "Não definido";
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

export function ClientPortal() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/client-portal/my-projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Não foi possível carregar os projetos."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#c8a13a]" />
        <p className="text-xs uppercase tracking-widest text-[#9b988f]">
          Carregando
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10 border-b border-[#2a2a2a] pb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
          Seus projetos
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-wide">
          Acompanhamento
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#9b988f]">
          Visualize o status e progresso dos seus projetos em andamento.
        </p>
      </header>

      {projects.length === 0 && (
        <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
          <p className="text-sm uppercase tracking-widest text-[#9b988f]">
            Nenhum projeto encontrado
          </p>
        </div>
      )}

      <div className="space-y-6">
        {projects.map((project) => {
          const progress = getProgress(project.status);
          const color = STATUS_COLORS[project.status] || "#c8a13a";
          const label = STATUS_LABELS[project.status] || project.status;
          const deadlineAlert = getDeadlineAlert(project.deadline);

          return (
            <article
              key={project.id}
              className="border border-[#2a2a2a] bg-[#101010] p-6"
            >
              {/* Título e status */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <h3 className="text-2xl font-semibold">{project.title}</h3>
                <span
                  className="shrink-0 border px-3 py-1 text-xs uppercase tracking-wider"
                  style={{ color, borderColor: color + "50" }}
                >
                  {label}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#9b988f]">
                    Progresso
                  </span>
                  <span className="text-sm font-semibold" style={{ color }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a]">
                  <div
                    className="h-1.5 transition-all duration-700"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  />
                </div>

                {/* Etapas */}
                <div className="mt-3 flex justify-between">
                  {STATUS_ORDER.map((s) => {
                    const currentIndex = STATUS_ORDER.indexOf(project.status);
                    const stepIndex = STATUS_ORDER.indexOf(s);
                    const isDone = stepIndex <= currentIndex;
                    return (
                      <div key={s} className="flex flex-col items-center gap-1">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: isDone ? color : "#2a2a2a",
                          }}
                        />
                        <span
                          className="hidden text-[9px] uppercase tracking-wider md:block"
                          style={{
                            color: isDone ? color : "#4a4a4a",
                          }}
                        >
                          {STATUS_LABELS[s].split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações */}
              <div className="grid gap-4 border-t border-[#2a2a2a] pt-5 text-sm md:grid-cols-3">
                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Início
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {formatDate(project.start_date)}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Prazo de entrega
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {formatDate(project.deadline)}
                  </strong>
                  {deadlineAlert && (
                    <span
                      className="mt-1 block text-xs uppercase tracking-wider"
                      style={{ color: deadlineAlert.color }}
                    >
                      {deadlineAlert.label}
                    </span>
                  )}
                </div>
                {project.description && (
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                      Descrição
                    </span>
                    <p className="mt-1 text-[#9b988f]">{project.description}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

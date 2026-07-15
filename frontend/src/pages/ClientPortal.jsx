import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";

const STATUS_ORDER = [
  "orcamento",
  "aprovado",
  "pre_producao",
  "gravando",
  "em_edicao",
  "revisao",
  "concluido",
];

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

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ─── Card do projeto ──────────────────────────────────────────
function ProjectCard({ project, onMarkRead }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const color = STATUS_COLORS[project.status] || "#c8a13a";
  const label = STATUS_LABELS[project.status] || project.status;
  const progress = getProgress(project.status);
  const deadlineAlert = getDeadlineAlert(project.deadline);

  async function handleExpand() {
    if (!expanded) {
      setLoadingNotes(true);
      try {
        const res = await api.get(
          `/client-portal/my-projects/${project.id}/notes`,
        );
        setNotes(res.data);
      } catch {
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }

      if (project.has_client_update) {
        try {
          await api.post(`/client-portal/mark-read/${project.id}`);
          onMarkRead(project.id);
        } catch {}
      }
    }
    setExpanded(!expanded);
  }

  return (
    <article
      className={`border bg-[#101010] transition ${project.has_client_update ? "border-[#c8a13a]/50" : "border-[#2a2a2a]"}`}
    >
      {/* Header clicável */}
      <div
        className="cursor-pointer p-6 transition hover:bg-[#131313]"
        onClick={handleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-[#f5f1e8]">
                {project.title}
              </h3>
              {project.has_client_update && (
                <span className="border border-[#c8a13a]/60 bg-[#1a1500] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#c8a13a]">
                  Nova atualização
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-[#9b988f]">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="shrink-0 border px-3 py-1 text-xs uppercase tracking-wider"
              style={{ color, borderColor: color + "50" }}
            >
              {label}
            </span>
            <span className="text-xs text-[#6f6b63]">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between">
            <span className="text-xs text-[#6f6b63]">Progresso</span>
            <span className="text-xs font-semibold" style={{ color }}>
              {progress}%
            </span>
          </div>
          <div className="h-1 w-full bg-[#1a1a1a]">
            <div
              className="h-1 transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-[#1a1a1a] p-6 space-y-6">
          {/* Etapas visuais */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#6f6b63]">
              Etapas
            </p>
            <div className="flex justify-between">
              {STATUS_ORDER.map((s) => {
                const currentIndex = STATUS_ORDER.indexOf(project.status);
                const stepIndex = STATUS_ORDER.indexOf(s);
                const isDone = stepIndex <= currentIndex;
                const isCurrent = s === project.status;
                const stepColor = STATUS_COLORS[s] || "#c8a13a";
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: isDone ? stepColor : "#2a2a2a",
                      }}
                    />
                    <span
                      className="hidden text-[9px] uppercase tracking-wider md:block"
                      style={{ color: isDone ? stepColor : "#4a4a4a" }}
                    >
                      {STATUS_LABELS[s]?.split(" ")[0]}
                    </span>
                    {isCurrent && (
                      <span className="hidden text-[8px] text-[#c8a13a] md:block">
                        ↑
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informações */}
          <div className="grid gap-4 border-t border-[#1a1a1a] pt-4 md:grid-cols-3">
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Início
              </span>
              <strong className="mt-1 block text-sm text-[#f5f1e8]">
                {formatDate(project.start_date)}
              </strong>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Prazo de entrega
              </span>
              <strong className="mt-1 block text-sm text-[#f5f1e8]">
                {formatDate(project.deadline)}
              </strong>
              {deadlineAlert && (
                <span
                  className="mt-1 block text-xs"
                  style={{ color: deadlineAlert.color }}
                >
                  {deadlineAlert.label}
                </span>
              )}
            </div>
            {project.current_phase_description && (
              <div>
                <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                  Em andamento
                </span>
                <p className="mt-1 text-sm text-[#9b988f]">
                  {project.current_phase_description}
                </p>
              </div>
            )}
          </div>

          {/* Atualizações */}
          <div className="border-t border-[#1a1a1a] pt-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#6f6b63]">
              Atualizações
            </p>

            {loadingNotes && (
              <div className="flex items-center gap-2 py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#c8a13a]" />
                <p className="text-xs text-[#6f6b63]">Carregando...</p>
              </div>
            )}

            {!loadingNotes && notes.length === 0 && (
              <p className="text-sm text-[#4a4a4a]">
                Nenhuma atualização ainda.
              </p>
            )}

            <div className="space-y-3">
              {notes.map((note) => {
                const isPhaseConclusion = note.content.startsWith("✓ Etapa");
                return (
                  <div
                    key={note.id}
                    className={`border p-4 ${isPhaseConclusion ? "border-[#c8a13a]/30 bg-[#1a1500]" : "border-[#1a1a1a] bg-[#0c0c0c]"}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#d9d2c0]">
                          {note.user_name}
                        </span>
                        {isPhaseConclusion && (
                          <span className="border border-[#c8a13a]/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#c8a13a]">
                            Etapa concluída
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#4a4a4a]">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#9b988f]">
                      {isPhaseConclusion
                        ? note.content.replace(
                            /^✓ Etapa "[^"]*" concluída\. /,
                            "",
                          )
                        : note.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Página principal ─────────────────────────────────────────
export function ClientPortal() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const context = useOutletContext();
  const setNotifications = context?.setNotifications;

  useEffect(() => {
    api
      .get("/client-portal/my-projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Não foi possível carregar os projetos."))
      .finally(() => setLoading(false));
  }, []);

  function handleMarkRead(projectId) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, has_client_update: false } : p,
      ),
    );
    if (setNotifications) {
      setNotifications((prev) => Math.max(0, prev - 1));
    }
  }

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

  const activeProjects = projects.filter(
    (p) => !["concluido", "cancelado", "arquivado"].includes(p.status),
  );
  const finishedProjects = projects.filter((p) =>
    ["concluido", "cancelado", "arquivado"].includes(p.status),
  );

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
          Visualize o status e progresso dos seus projetos.
        </p>
      </header>

      {projects.length === 0 && (
        <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
          <p className="text-sm uppercase tracking-widest text-[#9b988f]">
            Nenhum projeto encontrado
          </p>
        </div>
      )}

      {/* Projetos em andamento */}
      {activeProjects.length > 0 && (
        <div className="space-y-4">
          {activeProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}

      {/* Projetos finalizados */}
      {finishedProjects.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-xs uppercase tracking-widest text-[#6f6b63]">
            Projetos finalizados ({finishedProjects.length})
          </p>
          <div className="space-y-4 opacity-60">
            {finishedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onMarkRead={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

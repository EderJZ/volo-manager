import { api } from "../services/api";
import { useEffect, useState, useRef } from "react";

// ─── Constantes ───────────────────────────────────────────────
const ACTIVE_PHASES = [
  { key: "orcamento", label: "Orçamento" },
  { key: "aprovado", label: "Aprovado" },
  { key: "pre_producao", label: "Pré-produção" },
  { key: "gravando", label: "Gravando" },
  { key: "em_edicao", label: "Em edição" },
  { key: "revisao", label: "Revisão" },
  { key: "concluido", label: "Concluído" },
];

const SPECIAL_STATUSES = ["cancelado", "arquivado"];

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

const NOTE_TYPE_LABELS = {
  internal: "Interno",
  client: "Cliente",
};

function getTokenRole() {
  const token = localStorage.getItem("volo_token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
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

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 border border-[#3a3320] bg-[#1a1500] px-6 py-4 text-sm text-[#c8a13a] shadow-lg transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
    >
      <div className="flex items-center gap-3">
        <span>✓</span>
        {message}
      </div>
    </div>
  );
}

// ─── Modal de confirmação ─────────────────────────────────────
function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm border border-[#2a2a2a] bg-[#101010] p-8">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#9b988f]">{message}</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${danger ? "bg-red-900/60 text-red-300 hover:bg-red-900" : "bg-[#c8a13a] text-[#090909] hover:bg-[#e0bd55]"}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-[#2a2a2a] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────
function Drawer({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col border-l border-[#2a2a2a] bg-[#0c0c0c] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between border-b border-[#2a2a2a] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
              {subtitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-1 text-[#6f6b63] transition hover:text-[#f5f1e8]"
          >
            ✕
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
        {footer && (
          <div className="border-t border-[#2a2a2a] bg-[#0c0c0c] p-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Card do Kanban ───────────────────────────────────────────
function ProjectCard({ project, clients, onOpen }) {
  const color = STATUS_COLORS[project.status] || "#c8a13a";
  const deadlineAlert = getDeadlineAlert(project.deadline);
  const clientName =
    clients.find((c) => c.id === project.client_id)?.name || "—";

  return (
    <div
      onClick={() => onOpen(project)}
      className="cursor-pointer border border-[#2a2a2a] bg-[#101010] p-4 transition hover:border-[#4a422d] hover:bg-[#131313]"
    >
      {/* Título */}
      <h3 className="text-sm font-semibold text-[#f5f1e8] leading-snug">
        {project.title}
      </h3>

      {/* Cliente */}
      <p className="mt-1 text-xs text-[#9b988f]">{clientName}</p>

      {/* Descrição da fase */}
      {project.current_phase_description && (
        <p className="mt-2 text-xs leading-relaxed text-[#6f6b63] line-clamp-2">
          {project.current_phase_description}
        </p>
      )}

      {/* Footer do card */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#1a1a1a] pt-3">
        <div>
          {project.deadline && (
            <p
              className="text-xs"
              style={{ color: deadlineAlert ? deadlineAlert.color : "#6f6b63" }}
            >
              {deadlineAlert
                ? deadlineAlert.label
                : `Prazo: ${formatDate(project.deadline)}`}
            </p>
          )}
          {project.budget > 0 && (
            <p className="text-xs text-[#6f6b63]">
              {Number(project.budget).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          )}
        </div>
        {project.notes?.length > 0 && (
          <span className="text-xs text-[#6f6b63]">
            💬 {project.notes.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Coluna do Kanban ─────────────────────────────────────────
function KanbanColumn({ phase, projects, clients, onOpen }) {
  const color = STATUS_COLORS[phase.key] || "#c8a13a";
  const count = projects.length;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Header da coluna */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs uppercase tracking-[0.2em] text-[#d9d2c0]">
            {phase.label}
          </span>
        </div>
        <span className="text-xs text-[#6f6b63]">{count}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {count === 0 && (
          <div className="border border-dashed border-[#2a2a2a] p-4 text-center">
            <p className="text-xs text-[#4a4a4a]">Nenhum projeto</p>
          </div>
        )}
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            clients={clients}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Lista de fases com expansão ─────────────────────────────
function PhasesList({ phases, project, notes }) {
  const [expandedPhase, setExpandedPhase] = useState(null);

  return (
    <div className="space-y-2">
      {phases.map((phase) => {
        const phaseColor = STATUS_COLORS[phase.key];
        const isCurrent = project.status === phase.key;
        const currentIndex = phases.findIndex((p) => p.key === project.status);
        const phaseIndex = phases.findIndex((p) => p.key === phase.key);
        const isDone = phaseIndex <= currentIndex;

        const phaseNote = notes.find((n) =>
          n.content.startsWith(`✓ Etapa "${phase.label}" concluída.`),
        );

        const isExpanded = expandedPhase === phase.key;

        return (
          <div key={phase.key}>
            <button
              onClick={() => {
                if (isDone && phaseNote) {
                  setExpandedPhase(isExpanded ? null : phase.key);
                }
              }}
              className={`flex w-full items-center gap-3 border p-3 text-left transition ${
                isCurrent
                  ? "border-[#3a3320] bg-[#1a1500]"
                  : isDone
                    ? "border-[#1a1a1a] hover:border-[#2a2a2a]"
                    : "border-[#1a1a1a] cursor-default"
              }`}
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: isDone ? phaseColor : "#2a2a2a" }}
              />
              <span
                className="flex-1 text-sm"
                style={{ color: isDone ? "#d9d2c0" : "#4a4a4a" }}
              >
                {phase.label}
              </span>
              {isCurrent && (
                <span className="text-xs text-[#c8a13a]">atual</span>
              )}
              {isDone && !isCurrent && (
                <span className="text-xs text-[#5ce07a]">✓</span>
              )}
              {isDone && phaseNote && (
                <span className="text-xs text-[#6f6b63]">
                  {isExpanded ? "▲" : "▼"}
                </span>
              )}
            </button>

            {isExpanded && phaseNote && (
              <div className="border border-t-0 border-[#3a3320] bg-[#1a1500] px-4 py-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-[#6f6b63]">
                  Resumo da etapa
                </p>
                <p className="text-sm leading-relaxed text-[#9b988f]">
                  {phaseNote.content.replace(
                    `✓ Etapa "${phase.label}" concluída. `,
                    "",
                  )}
                </p>
                <p className="mt-2 text-xs text-[#4a4a4a]">
                  {formatDateTime(phaseNote.created_at)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Drawer de detalhes do projeto ────────────────────────────
function ProjectDrawer({
  project,
  clients,
  open,
  onClose,
  onUpdate,
  showToast,
  userRole,
}) {
  const [form, setForm] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ content: "", type: "internal" });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [savedDescription, setSavedDescription] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [concludeModal, setConcludeModal] = useState({
    open: false,
    summary: "",
  });

  const isFinished =
    project && ["concluido", "cancelado"].includes(project.status);
  const canManagePhases = ["admin", "editor"].includes(userRole);
  const isAdmin = userRole === "admin";
  const color = project
    ? STATUS_COLORS[project.status] || "#c8a13a"
    : "#c8a13a";
  const currentPhaseLabel = project
    ? ACTIVE_PHASES.find((p) => p.key === project.status)?.label ||
      project.status
    : "";

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        budget: project.budget || "",
        start_date: project.start_date || "",
        deadline: project.deadline || "",
        client_id: String(project.client_id || ""),
        current_phase_description: project.current_phase_description || "",
      });
      setSavedDescription(project.current_phase_description || "");
      setTab("overview");
      loadNotes();
    }
  }, [project]);

  async function loadNotes() {
    if (!project) return;
    try {
      const res = await api.get(`/projects/${project.id}/notes/`);
      setNotes(res.data);
    } catch {
      setNotes([]);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await api.put(`/projects/${project.id}`, {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        client_id: Number(form.client_id),
        start_date: form.start_date || null,
        deadline: form.deadline || null,
      });
      showToast("Projeto atualizado!");
      onUpdate();
    } catch {
      showToast("Erro ao salvar projeto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvance() {
    try {
      await api.post(`/projects/${project.id}/phases/advance`);
      showToast("Projeto avançado de fase!");
      onUpdate();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Erro ao avançar fase.");
    }
  }

  async function handleRetreat() {
    try {
      await api.post(`/projects/${project.id}/phases/retreat`);
      showToast("Projeto voltou de fase.");
      onUpdate();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Erro ao voltar fase.");
    }
  }

  async function handleCancel() {
    setModal({
      open: true,
      title: "Cancelar projeto",
      message:
        "Tem certeza? O projeto será cancelado e ficará somente leitura.",
      confirmLabel: "Cancelar projeto",
      danger: true,
      onConfirm: async () => {
        setModal({ open: false });
        try {
          await api.post(`/projects/${project.id}/phases/cancel`);
          showToast("Projeto cancelado.");
          onUpdate();
          onClose();
        } catch {
          showToast("Erro ao cancelar projeto.");
        }
      },
    });
  }

  async function handleArchive() {
    try {
      await api.post(`/projects/${project.id}/phases/archive`);
      showToast("Projeto arquivado.");
      onUpdate();
      onClose();
    } catch {
      showToast("Erro ao arquivar projeto.");
    }
  }

  async function handleRestore() {
    try {
      await api.post(`/projects/${project.id}/phases/restore`);
      showToast("Projeto restaurado!");
      onUpdate();
      onClose();
    } catch {
      showToast("Erro ao restaurar projeto.");
    }
  }

  async function handleDelete() {
    setModal({
      open: true,
      title: "Excluir projeto",
      message: "Esta ação é permanente e não pode ser desfeita.",
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: async () => {
        setModal({ open: false });
        try {
          await api.delete(`/projects/${project.id}`);
          showToast("Projeto excluído.");
          onUpdate();
          onClose();
        } catch {
          showToast("Erro ao excluir projeto.");
        }
      },
    });
  }

  async function handleAddNote() {
    if (!newNote.content.trim()) return;
    try {
      await api.post(`/projects/${project.id}/notes/`, newNote);
      setNewNote({ content: "", type: "internal" });
      showToast("Anotação adicionada!");
      loadNotes();
      onUpdate();
    } catch {
      showToast("Erro ao adicionar anotação.");
    }
  }

  async function handleUpdateNote(noteId) {
    if (!editingNoteContent.trim()) return;
    try {
      await api.put(`/projects/${project.id}/notes/${noteId}`, {
        content: editingNoteContent,
      });
      setEditingNoteId(null);
      showToast("Anotação atualizada!");
      loadNotes();
    } catch {
      showToast("Erro ao atualizar anotação.");
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await api.delete(`/projects/${project.id}/notes/${noteId}`);
      showToast("Anotação removida.");
      loadNotes();
      onUpdate();
    } catch {
      showToast("Erro ao remover anotação.");
    }
  }

  if (!project) return null;

  const canConclude = savedDescription.trim() !== "" && notes.length > 0;

  const footer =
    !isFinished && canManagePhases && tab === "overview" ? (
      <div className="space-y-3">
        {/* Modal de conclusão */}
        {concludeModal.open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setConcludeModal({ open: false, summary: "" })}
            />
            <div className="relative w-full max-w-sm border border-[#2a2a2a] bg-[#101010] p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
                Concluir etapa
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Concluindo: {currentPhaseLabel}
              </h3>
              <p className="mt-2 text-sm text-[#9b988f]">
                Escreva um resumo do que foi feito nessa etapa. Isso ficará
                visível para o cliente.
              </p>
              <textarea
                className="mt-4 min-h-24 w-full resize-none border border-[#2a2a2a] bg-[#171717] p-3 text-sm text-[#f5f1e8] outline-none focus:border-[#c8a13a] placeholder:text-[#4a4a4a]"
                placeholder="Ex: Gravação concluída com sucesso. Todas as cenas aprovadas..."
                value={concludeModal.summary}
                onChange={(e) =>
                  setConcludeModal({
                    ...concludeModal,
                    summary: e.target.value,
                  })
                }
              />
              <div className="mt-6 flex gap-3">
                <button
                  disabled={!concludeModal.summary.trim()}
                  onClick={async () => {
                    try {
                      await api.post(`/projects/${project.id}/notes/`, {
                        content: `✓ Etapa "${currentPhaseLabel}" concluída. ${concludeModal.summary}`,
                        type: "client",
                      });
                      await api.post(`/projects/${project.id}/phases/advance`);
                      setConcludeModal({ open: false, summary: "" });
                      showToast(`Etapa ${currentPhaseLabel} concluída!`);
                      await loadNotes();
                      onUpdate();
                      onClose();
                    } catch {
                      showToast("Erro ao concluir etapa.");
                    }
                  }}
                  className="flex-1 bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConcludeModal({ open: false, summary: "" })}
                  className="flex-1 border border-[#2a2a2a] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown de opções */}
        <div className="relative">
          <button
            onClick={() => setOptionsOpen(!optionsOpen)}
            className="flex items-center gap-2 border border-[#2a2a2a] px-4 py-2 text-xs uppercase tracking-wider text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
          >
            ⚙ Opções {optionsOpen ? "▲" : "▼"}
          </button>

          {optionsOpen && (
            <div className="absolute bottom-10 left-0 z-10 border border-[#2a2a2a] bg-[#0c0c0c] py-1 shadow-xl">
              {project.status !== "orcamento" && (
                <button
                  onClick={() => {
                    setOptionsOpen(false);
                    handleRetreat();
                  }}
                  className="block w-full px-6 py-2 text-left text-xs uppercase tracking-wider text-[#9b988f] transition hover:bg-[#171717] hover:text-[#c8a13a]"
                >
                  ← Voltar fase
                </button>
              )}
              <button
                onClick={() => {
                  setOptionsOpen(false);
                  handleArchive();
                }}
                className="block w-full px-6 py-2 text-left text-xs uppercase tracking-wider text-[#9b988f] transition hover:bg-[#171717] hover:text-[#9b988f]"
              >
                Arquivar
              </button>
              <button
                onClick={() => {
                  setOptionsOpen(false);
                  handleCancel();
                }}
                className="block w-full px-6 py-2 text-left text-xs uppercase tracking-wider text-red-400 transition hover:bg-red-950/40"
              >
                Cancelar projeto
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setOptionsOpen(false);
                    handleDelete();
                  }}
                  className="block w-full px-6 py-2 text-left text-xs uppercase tracking-wider text-red-500 transition hover:bg-red-950/40"
                >
                  Excluir permanentemente
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botão principal */}
        <button
          disabled={!canConclude || project.status === "concluido"}
          onClick={() => setConcludeModal({ open: true, summary: "" })}
          className="w-full bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {project.status === "concluido"
            ? "Projeto concluído"
            : "Concluir etapa e avançar →"}
        </button>

        {!canConclude && (
          <p className="text-center text-xs text-[#4a4a4a]">
            {!savedDescription.trim()
              ? "Preencha o campo 'O que está sendo feito' para continuar."
              : "Adicione pelo menos uma anotação para continuar."}
          </p>
        )}

        {project.status === "arquivado" && (
          <button
            onClick={handleRestore}
            className="w-full border border-green-900/60 px-4 py-2 text-xs uppercase tracking-wider text-green-300 transition hover:bg-green-950/40"
          >
            Restaurar projeto
          </button>
        )}
      </div>
    ) : null;

  return (
    <>
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ open: false })}
      />

      <Drawer
        open={open}
        onClose={onClose}
        title={project.title}
        subtitle={`Projeto #${project.id}`}
        footer={footer}
      >
        {/* Status badge */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="border px-3 py-1 text-xs uppercase tracking-wider"
            style={{ color, borderColor: color + "50" }}
          >
            {currentPhaseLabel}
          </span>
          {project.has_client_update && (
            <span className="text-xs text-[#c8a13a]">
              ● Atualização enviada ao cliente
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-[#2a2a2a]">
          {[
            { key: "overview", label: "Visão geral" },
            { key: "notes", label: `Anotações (${notes.length})` },
            { key: "phases", label: "Fases" },
            { key: "details", label: "Editar" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition ${tab === t.key ? "border-b-2 border-[#c8a13a] text-[#c8a13a]" : "text-[#6f6b63] hover:text-[#9b988f]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Visão Geral */}
        {tab === "overview" && (
          <div className="space-y-6 pb-32">
            {/* O que está sendo feito */}
            <div className="border border-[#2a2a2a] bg-[#101010] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6f6b63]">
                O que está sendo feito
              </p>

              {savedDescription && (
                <p className="mt-2 mb-3 text-sm leading-relaxed text-[#9b988f] border-b border-[#1a1a1a] pb-3">
                  {savedDescription}
                </p>
              )}

              {!isFinished ? (
                <div className="mt-2">
                  <textarea
                    className="min-h-20 w-full resize-none bg-transparent text-sm text-[#f5f1e8] outline-none placeholder:text-[#4a4a4a]"
                    placeholder="Descreva o que está acontecendo nessa fase..."
                    value={form.current_phase_description || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        current_phase_description: e.target.value,
                      })
                    }
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      disabled={!form.current_phase_description?.trim()}
                      onClick={async () => {
                        try {
                          await api.put(`/projects/${project.id}`, {
                            title: form.title,
                            description: form.description,
                            status: project.status,
                            budget: form.budget ? Number(form.budget) : null,
                            client_id: Number(form.client_id),
                            start_date: form.start_date || null,
                            deadline: form.deadline || null,
                            current_phase_description:
                              form.current_phase_description,
                          });
                          setSavedDescription(form.current_phase_description);
                          setForm({ ...form, current_phase_description: "" });
                          showToast("Descrição salva!");
                          onUpdate();
                        } catch {
                          showToast("Erro ao salvar descrição.");
                        }
                      }}
                      className="bg-[#c8a13a] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#9b988f]">
                  {savedDescription || "Sem descrição."}
                </p>
              )}
            </div>

            {/* Últimas anotações */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6f6b63]">
                  Últimas anotações
                </p>
                <button
                  onClick={() => setTab("notes")}
                  className="text-xs text-[#c8a13a] hover:underline"
                >
                  Ver todas →
                </button>
              </div>

              {notes.length === 0 && (
                <p className="text-sm text-[#4a4a4a]">
                  Nenhuma anotação ainda.
                </p>
              )}

              <div className="space-y-3">
                {notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className={`border p-3 ${note.is_phase_conclusion ? "border-[#c8a13a]/40 bg-[#1a1500]" : "border-[#1a1a1a] bg-[#101010]"}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#d9d2c0]">
                          {note.user_name}
                        </span>
                        {note.is_phase_conclusion && (
                          <span className="border border-[#c8a13a]/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#c8a13a]">
                            Etapa concluída
                          </span>
                        )}
                        {!note.is_phase_conclusion && (
                          <span
                            className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${note.type === "client" ? "border-[#3a3320] text-[#c8a13a]" : "border-[#2a2a2a] text-[#6f6b63]"}`}
                          >
                            {NOTE_TYPE_LABELS[note.type]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#4a4a4a]">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#9b988f] line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Anotação rápida */}
              {!isFinished && (
                <div className="mt-4 border border-[#2a2a2a] bg-[#101010] p-3">
                  <textarea
                    className="min-h-16 w-full resize-none bg-transparent text-sm text-[#f5f1e8] outline-none placeholder:text-[#4a4a4a]"
                    placeholder="Adicionar anotação rápida..."
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      {["internal", "client"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewNote({ ...newNote, type })}
                          className={`px-3 py-1 text-xs uppercase tracking-wider transition border ${newNote.type === type ? "border-[#c8a13a] text-[#c8a13a]" : "border-[#2a2a2a] text-[#6f6b63] hover:border-[#9b988f]"}`}
                        >
                          {NOTE_TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.content.trim()}
                      className="bg-[#c8a13a] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Anotações */}
        {tab === "notes" && (
          <div className="space-y-4">
            {!isFinished && (
              <div className="border border-[#2a2a2a] bg-[#101010] p-4">
                <textarea
                  className="min-h-24 w-full resize-none bg-transparent text-sm text-[#f5f1e8] outline-none placeholder:text-[#6f6b63]"
                  placeholder="Escreva uma anotação..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    {["internal", "client"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewNote({ ...newNote, type })}
                        className={`px-3 py-1 text-xs uppercase tracking-wider transition border ${newNote.type === type ? "border-[#c8a13a] text-[#c8a13a]" : "border-[#2a2a2a] text-[#6f6b63] hover:border-[#9b988f]"}`}
                      >
                        {NOTE_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.content.trim()}
                    className="bg-[#c8a13a] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#090909] transition hover:bg-[#e0bd55] disabled:opacity-40"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 && (
              <p className="text-center text-sm text-[#6f6b63]">
                Nenhuma anotação ainda.
              </p>
            )}

            {notes.map((note) => (
              <div
                key={note.id}
                className="border border-[#2a2a2a] bg-[#101010] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#d9d2c0]">
                      {note.user_name}
                    </span>
                    <span
                      className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${note.type === "client" ? "border-[#3a3320] text-[#c8a13a]" : "border-[#2a2a2a] text-[#6f6b63]"}`}
                    >
                      {NOTE_TYPE_LABELS[note.type]}
                    </span>
                  </div>
                  <span className="text-xs text-[#6f6b63]">
                    {formatDateTime(note.created_at)}
                  </span>
                </div>

                {editingNoteId === note.id ? (
                  <div>
                    <textarea
                      className="min-h-20 w-full resize-none border border-[#2a2a2a] bg-[#171717] p-3 text-sm text-[#f5f1e8] outline-none focus:border-[#c8a13a]"
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        className="bg-[#c8a13a] px-3 py-1 text-xs font-semibold uppercase text-[#090909] hover:bg-[#e0bd55]"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="border border-[#2a2a2a] px-3 py-1 text-xs uppercase text-[#9b988f] hover:text-[#c8a13a]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-relaxed text-[#9b988f]">
                      {note.content}
                    </p>
                    {note.updated_at && (
                      <p className="mt-1 text-xs text-[#4a4a4a]">
                        Editado em {formatDateTime(note.updated_at)}
                      </p>
                    )}
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteContent(note.content);
                        }}
                        className="text-xs text-[#6f6b63] hover:text-[#c8a13a]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs text-[#6f6b63] hover:text-red-400"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Fases */}
        {tab === "phases" && (
          <PhasesList phases={ACTIVE_PHASES} project={project} notes={notes} />
        )}

        {/* Tab: Editar */}
        {tab === "details" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Título
              </label>
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isFinished}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Descrição
              </label>
              <textarea
                className="min-h-20 w-full resize-none border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] placeholder:text-[#6f6b63]"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={isFinished}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Cliente
              </label>
              <select
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
                value={form.client_id || ""}
                onChange={(e) =>
                  setForm({ ...form, client_id: e.target.value })
                }
                disabled={isFinished}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` — ${c.company}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                Orçamento (R$)
              </label>
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
                type="number"
                step="0.01"
                value={form.budget || ""}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                disabled={isFinished}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                  Início
                </label>
                <input
                  className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] [color-scheme:dark]"
                  type="date"
                  value={form.start_date || ""}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  disabled={isFinished}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                  Prazo
                </label>
                <input
                  className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] [color-scheme:dark]"
                  type="date"
                  value={form.deadline || ""}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  disabled={isFinished}
                />
              </div>
            </div>

            {!isFinished && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55] disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}

// ─── Formulário de novo projeto ───────────────────────────────
function NewProjectDrawer({ open, onClose, clients, onCreated, showToast }) {
  const emptyForm = {
    title: "",
    description: "",
    budget: "",
    start_date: "",
    deadline: "",
    client_id: "",
    current_phase_description: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Título é obrigatório.";
    if (!form.client_id) e.client_id = "Selecione um cliente.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/projects/", {
        ...form,
        status: "orcamento",
        budget: form.budget ? Number(form.budget) : null,
        client_id: Number(form.client_id),
        start_date: form.start_date || null,
        deadline: form.deadline || null,
      });
      showToast("Projeto criado!");
      setForm(emptyForm);
      onCreated();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Erro ao criar projeto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Novo projeto"
      subtitle="Cadastro"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
            Título
          </label>
          <input
            className={`w-full border px-4 py-3 bg-[#171717] text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] ${errors.title ? "border-red-500" : "border-[#2a2a2a] focus:border-[#c8a13a]"}`}
            placeholder="Nome do projeto"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setErrors({ ...errors, title: "" });
            }}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
            Cliente
          </label>
          <select
            className={`w-full border px-4 py-3 bg-[#171717] text-[#f5f1e8] outline-none transition ${errors.client_id ? "border-red-500" : "border-[#2a2a2a] focus:border-[#c8a13a]"}`}
            value={form.client_id}
            onChange={(e) => {
              setForm({ ...form, client_id: e.target.value });
              setErrors({ ...errors, client_id: "" });
            }}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` — ${c.company}` : ""}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-xs text-red-400">{errors.client_id}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
            Descrição
          </label>
          <textarea
            className="min-h-20 w-full resize-none border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] placeholder:text-[#6f6b63]"
            placeholder="Descrição do projeto"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
            Orçamento (R$)
          </label>
          <input
            className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              Início
            </label>
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] [color-scheme:dark]"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              Prazo
            </label>
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a] [color-scheme:dark]"
              type="date"
              min={form.start_date || undefined}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55] disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar projeto"}
        </button>
      </form>
    </Drawer>
  );
}

// ─── Página principal ─────────────────────────────────────────
export function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newDrawerOpen, setNewDrawerOpen] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const userRole = getTokenRole();

  const scrollRef = useRef(null);

  function scrollKanban(direction) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  async function loadAll() {
    try {
      const [projRes, clientRes] = await Promise.all([
        api.get("/projects/"),
        api.get("/clients/"),
      ]);
      setProjects(projRes.data);
      setClients(clientRes.data);
    } catch {
      showToast("Erro ao carregar dados.");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openProject(project) {
    setSelectedProject(project);
    setDrawerOpen(true);
  }

  const activeProjects = projects.filter(
    (p) => !["concluido", "cancelado", "arquivado"].includes(p.status),
  );
  const finishedProjects = projects.filter((p) =>
    ["concluido", "cancelado", "arquivado"].includes(p.status),
  );

  return (
    <main>
      <Toast message={toast.message} visible={toast.visible} />

      <NewProjectDrawer
        open={newDrawerOpen}
        onClose={() => setNewDrawerOpen(false)}
        clients={clients}
        onCreated={loadAll}
        showToast={showToast}
      />

      <ProjectDrawer
        project={selectedProject}
        clients={clients}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProject(null);
        }}
        onUpdate={loadAll}
        showToast={showToast}
        userRole={userRole}
      />

      {/* Cabeçalho */}
      <header className="mb-8 flex items-end justify-between border-b border-[#2a2a2a] pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Produção
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-wide">
            Projetos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
            Gerencie o pipeline de produção audiovisual da Volo Visual.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFinished(!showFinished)}
            className="text-xs uppercase tracking-widest text-[#9b988f] transition hover:text-[#c8a13a]"
          >
            {showFinished
              ? "Ver em andamento"
              : `Finalizados (${finishedProjects.length})`}
          </button>
          <button
            onClick={() => setNewDrawerOpen(true)}
            className="bg-[#c8a13a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
          >
            + Novo projeto
          </button>
        </div>
      </header>

      {/* Board Kanban — projetos em andamento */}
      {!showFinished && (
        <div className="relative">
          {/* Gradiente esquerda */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-[#090909] to-transparent" />

          {/* Gradiente direita */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#090909] to-transparent" />

          {/* Botão esquerda */}
          <button
            onClick={() => scrollKanban(-1)}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 border border-[#2a2a2a] bg-[#101010] px-4 py-5 text-2xl text-[#c8a13a] transition hover:border-[#c8a13a] hover:bg-[#1a1500]"
          >
            ‹
          </button>

          {/* Botão direita */}
          <button
            onClick={() => scrollKanban(1)}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 border border-[#2a2a2a] bg-[#101010] px-4 py-5 text-2xl text-[#c8a13a] transition hover:border-[#c8a13a] hover:bg-[#1a1500]"
          >
            ›
          </button>

          {/* Board */}
          <div
            ref={scrollRef}
            className="overflow-x-auto px-8 pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {ACTIVE_PHASES.map((phase) => (
                <KanbanColumn
                  key={phase.key}
                  phase={phase}
                  projects={activeProjects.filter(
                    (p) => p.status === phase.key,
                  )}
                  clients={clients}
                  onOpen={openProject}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Projetos finalizados */}
      {showFinished && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xs uppercase tracking-widest text-[#9b988f]">
              {finishedProjects.length} projeto(s) finalizado(s)
            </p>
          </div>
          {finishedProjects.length === 0 && (
            <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-[#9b988f]">
                Nenhum projeto finalizado
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {finishedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openProject(project)}
                className="cursor-pointer border border-[#2a2a2a] bg-[#101010] p-5 opacity-70 transition hover:opacity-100 hover:border-[#4a422d]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">
                    {project.title}
                  </h3>
                  <span
                    className="shrink-0 border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                    style={{
                      color: STATUS_COLORS[project.status],
                      borderColor: STATUS_COLORS[project.status] + "50",
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#9b988f]">
                  {clients.find((c) => c.id === project.client_id)?.name || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

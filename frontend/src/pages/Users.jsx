import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "editor",
};

const emptyErrors = {
  name: "",
  email: "",
  password: "",
};

const ROLE_LABELS = {
  admin: "Administrador",
  editor: "Editor",
  operator: "Operador",
};

const ROLE_COLORS = {
  admin: { text: "#c8a13a", border: "#3a3320" },
  editor: { text: "#5c9be0", border: "#1f2f4a" },
  operator: { text: "#9b988f", border: "#2a2a2a" },
};

function getRoleStyle(role) {
  return ROLE_COLORS[role] || { text: "#9b988f", border: "#2a2a2a" };
}

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function validate(form, isEditing) {
  const errors = { ...emptyErrors };
  let valid = true;

  if (!form.name.trim()) {
    errors.name = "Nome é obrigatório.";
    valid = false;
  }
  if (!form.email.trim()) {
    errors.email = "Email é obrigatório.";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email inválido.";
    valid = false;
  }
  if (!isEditing && !form.password.trim()) {
    errors.password = "Senha é obrigatória.";
    valid = false;
  } else if (!isEditing && form.password.length < 6) {
    errors.password = "Senha deve ter pelo menos 6 caracteres.";
    valid = false;
  }

  return { errors, valid };
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
function Drawer({ open, onClose, title, subtitle, children }) {
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
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-[#2a2a2a] bg-[#0c0c0c] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
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
      </div>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────
export function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [apiError, setApiError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [modal, setModal] = useState({ open: false });

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  function openModal({
    title,
    message,
    confirmLabel,
    danger = false,
    onConfirm,
  }) {
    setModal({ open: true, title, message, confirmLabel, danger, onConfirm });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  async function loadUsers() {
    try {
      const response = await api.get("/users/");
      setUsers(response.data.filter((u) => u.role !== "client"));
    } catch {
      showToast("Não foi possível carregar os usuários.");
    }
  }

  function openDrawerNew() {
    setEditingUserId(null);
    setForm(emptyForm);
    setFieldErrors(emptyErrors);
    setApiError("");
    setDrawerOpen(true);
  }

  function openDrawerEdit(user) {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFieldErrors(emptyErrors);
    setApiError("");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setFieldErrors(emptyErrors);
    setApiError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((e) => ({ ...e, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    const { errors, valid } = validate(form, !!editingUserId);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (editingUserId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingUserId}`, payload);
        showToast("Usuário atualizado!");
      } else {
        await api.post("/users/", form);
        showToast("Usuário cadastrado!");
      }
      closeDrawer();
      loadUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setApiError(detail);
      else setApiError("Não foi possível salvar o usuário.");
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(user) {
    openModal({
      title: "Excluir usuário",
      message: `Deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/users/${user.id}`);
          showToast(`"${user.name}" foi excluído.`);
          loadUsers();
        } catch (err) {
          const detail = err.response?.data?.detail;
          showToast(
            typeof detail === "string" ? detail : "Não foi possível excluir.",
          );
        }
      },
    });
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main>
      <Toast message={toast.message} visible={toast.visible} />
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingUserId ? "Atualizar usuário" : "Novo usuário"}
        subtitle={editingUserId ? "Edição" : "Cadastro"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              Nome completo
            </label>
            <input
              className={`w-full border px-4 py-3 bg-[#171717] text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] ${fieldErrors.name ? "border-red-500" : "border-[#2a2a2a] focus:border-[#c8a13a]"}`}
              name="name"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              Email
            </label>
            <input
              className={`w-full border px-4 py-3 bg-[#171717] text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] ${fieldErrors.email ? "border-red-500" : "border-[#2a2a2a] focus:border-[#c8a13a]"}`}
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              {editingUserId ? "Nova senha (deixe vazio para manter)" : "Senha"}
            </label>
            <input
              className={`w-full border px-4 py-3 bg-[#171717] text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] ${fieldErrors.password ? "border-red-500" : "border-[#2a2a2a] focus:border-[#c8a13a]"}`}
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
              Perfil
            </label>
            <select
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="operator">Operador</option>
            </select>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 border border-red-900/40 bg-red-950/20 px-4 py-3">
              <span className="text-red-400">✕</span>
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : editingUserId
                  ? "Atualizar usuário"
                  : "Cadastrar usuário"}
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="border border-[#2a2a2a] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#9b988f] transition hover:border-[#c8a13a] hover:text-[#c8a13a]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Drawer>

      {/* Cabeçalho */}
      <header className="mb-10 flex items-end justify-between border-b border-[#2a2a2a] pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Administração
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-wide">
            Usuários
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
            Gerencie os usuários com acesso ao Volo Manager.
          </p>
        </div>
        <button
          onClick={openDrawerNew}
          className="bg-[#c8a13a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
        >
          + Novo usuário
        </button>
      </header>

      {/* Lista */}
      <section className="grid gap-4">
        {users.length === 0 && (
          <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
            <p className="text-sm uppercase tracking-widest text-[#9b988f]">
              Nenhum usuário cadastrado
            </p>
          </div>
        )}

        {users.map((user) => {
          const roleStyle = getRoleStyle(user.role);
          return (
            <article
              key={user.id}
              className="border border-[#2a2a2a] bg-[#101010] p-6 transition hover:border-[#4a422d]"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#3a3320] bg-[#1a1500] text-sm font-semibold text-[#c8a13a]">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <span
                        className="border px-2 py-1 text-xs uppercase tracking-wider"
                        style={{
                          color: roleStyle.text,
                          borderColor: roleStyle.border,
                        }}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#9b988f]">{user.email}</p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-3">
                  <button
                    className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                    onClick={() => openDrawerEdit(user)}
                  >
                    Editar
                  </button>
                  <button
                    className="border border-red-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-950/40"
                    onClick={() => confirmDelete(user)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

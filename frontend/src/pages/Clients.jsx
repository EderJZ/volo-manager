import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  password: "",
};

const emptyErrors = {
  name: "",
  email: "",
  phone: "",
  company: "",
  password: "",
};

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

// Componente de campo com validação
function Field({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Componente de input padrão
function Input({ error, ...props }) {
  return (
    <input
      className={`w-full border px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] bg-[#171717] ${
        error
          ? "border-red-500 focus:border-red-400"
          : "border-[#2a2a2a] focus:border-[#c8a13a]"
      }`}
      {...props}
    />
  );
}

// Toast de sucesso
function Toast({ message, visible }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 border border-[#3a3320] bg-[#1a1500] px-6 py-4 text-sm text-[#c8a13a] shadow-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-base">✓</span>
        {message}
      </div>
    </div>
  );
}

// Modal de confirmação
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  danger = false,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm border border-[#2a2a2a] bg-[#101010] p-8">
        <h3 className="text-xl font-semibold text-[#f5f1e8]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#9b988f]">{message}</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${
              danger
                ? "bg-red-900/60 text-red-300 hover:bg-red-900"
                : "bg-[#c8a13a] text-[#090909] hover:bg-[#e0bd55]"
            }`}
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

// Drawer
function Drawer({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Painel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-[#2a2a2a] bg-[#0c0c0c] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header do drawer */}
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

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}

export function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [apiError, setApiError] = useState("");
  const [editingClientId, setEditingClientId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Modal de confirmação
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "",
    danger: false,
    onConfirm: null,
  });

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

  async function loadClients() {
    try {
      const response = await api.get("/clients/");
      setClients(response.data);
    } catch {
      setApiError("Não foi possível carregar os clientes.");
    }
  }

  function openDrawerNew() {
    setEditingClientId(null);
    setForm(emptyForm);
    setFieldErrors(emptyErrors);
    setApiError("");
    setDrawerOpen(true);
  }

  function openDrawerEdit(client) {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      password: "",
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
    if (fieldErrors[name]) {
      setFieldErrors((e) => ({ ...e, [name]: "" }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    const { errors, valid } = validate(form, !!editingClientId);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (editingClientId) {
        const payload = { ...form };
        delete payload.password;
        await api.put(`/clients/${editingClientId}`, payload);
        showToast("Cliente atualizado com sucesso!");
      } else {
        await api.post("/clients/", form);
        showToast("Cliente cadastrado com sucesso!");
      }
      closeDrawer();
      loadClients();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setApiError(detail.map((i) => i.msg).join(" | "));
      } else if (typeof detail === "string") {
        setApiError(detail);
      } else {
        setApiError("Não foi possível salvar o cliente.");
      }
    } finally {
      setLoading(false);
    }
  }

  function confirmDeactivate(client) {
    openModal({
      title: "Desativar cliente",
      message: `Deseja desativar "${client.name}"? O cliente perderá acesso ao portal, mas seus dados serão mantidos.`,
      confirmLabel: "Desativar",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/clients/${client.id}`);
          showToast(`"${client.name}" foi desativado.`);
          loadClients();
        } catch {
          setApiError("Não foi possível desativar o cliente.");
        }
      },
    });
  }

  function confirmActivate(client) {
    openModal({
      title: "Reativar cliente",
      message: `Deseja reativar "${client.name}"? O cliente voltará a ter acesso ao portal.`,
      confirmLabel: "Reativar",
      danger: false,
      onConfirm: async () => {
        closeModal();
        try {
          await api.put(`/clients/${client.id}`, { is_active: true });
          showToast(`"${client.name}" foi reativado.`);
          loadClients();
        } catch {
          setApiError("Não foi possível reativar o cliente.");
        }
      },
    });
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = showInactive
    ? clients
    : clients.filter((c) => c.is_active);

  return (
    <main>
      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* Modal de confirmação */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingClientId ? "Atualizar cliente" : "Novo cliente"}
        subtitle={editingClientId ? "Edição" : "Cadastro"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Nome completo" error={fieldErrors.name}>
            <Input
              name="name"
              placeholder="João Silva"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <Input
              name="email"
              type="email"
              placeholder="joao@email.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Telefone" error={fieldErrors.phone}>
              <Input
                name="phone"
                placeholder="(41) 99999-9999"
                value={form.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
              />
            </Field>
            <Field label="Empresa" error={fieldErrors.company}>
              <Input
                name="company"
                placeholder="Empresa Ltda"
                value={form.company}
                onChange={handleChange}
                error={fieldErrors.company}
              />
            </Field>
          </div>

          {!editingClientId && (
            <Field
              label="Senha de acesso ao portal"
              error={fieldErrors.password}
            >
              <Input
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
              />
            </Field>
          )}

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
                : editingClientId
                  ? "Atualizar cliente"
                  : "Cadastrar cliente"}
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
            Relacionamento
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-wide">
            Clientes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
            Gerencie contatos, empresas e informações comerciais dos clientes.
          </p>
        </div>
        <button
          onClick={openDrawerNew}
          className="bg-[#c8a13a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
        >
          + Novo cliente
        </button>
      </header>

      {/* Filtro */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowInactive(!showInactive)}
          className="text-xs uppercase tracking-widest text-[#9b988f] transition hover:text-[#c8a13a]"
        >
          {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
        </button>
      </div>

      {/* Lista */}
      <section className="grid gap-4">
        {filteredClients.length === 0 && (
          <div className="border border-[#2a2a2a] bg-[#101010] p-10 text-center">
            <p className="text-sm uppercase tracking-widest text-[#9b988f]">
              Nenhum cliente encontrado
            </p>
          </div>
        )}

        {filteredClients.map((client) => (
          <article
            key={client.id}
            className={`border bg-[#101010] p-6 transition hover:border-[#4a422d] ${
              client.is_active
                ? "border-[#2a2a2a]"
                : "border-[#2a2a2a] opacity-50"
            }`}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#3a3320] bg-[#1a1500] text-sm font-semibold text-[#c8a13a]">
                  {getInitials(client.name)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
                      Cliente #{client.id}
                    </p>
                    {!client.is_active && (
                      <span className="border border-[#3a3a3a] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#6f6b63]">
                        Inativo
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold">{client.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#9b988f]">
                    <span>{client.email}</span>
                    {client.phone && <span>{client.phone}</span>}
                    {client.company && <span>{client.company}</span>}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                  onClick={() => openDrawerEdit(client)}
                >
                  Editar
                </button>
                {client.is_active ? (
                  <button
                    className="border border-red-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-950/40"
                    onClick={() => confirmDeactivate(client)}
                  >
                    Desativar
                  </button>
                ) : (
                  <button
                    className="border border-green-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-green-300 transition hover:bg-green-950/40"
                    onClick={() => confirmActivate(client)}
                  >
                    Reativar
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

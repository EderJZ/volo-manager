import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
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

export function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClientId, setEditingClientId] = useState(null);
  const [error, setError] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  async function loadClients() {
    try {
      const response = await api.get("/clients/");
      setClients(response.data);
    } catch (err) {
      setError("Não foi possível carregar os clientes.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingClientId) {
        const payload = { ...form };
        delete payload.password;
        await api.put(`/clients/${editingClientId}`, payload);
      } else {
        await api.post("/clients/", form);
      }
      setForm(emptyForm);
      setEditingClientId(null);
      loadClients();
    } catch (err) {
      const apiError = err.response?.data?.detail;
      if (Array.isArray(apiError)) {
        setError(apiError.map((item) => item.msg).join(" | "));
        return;
      }
      if (typeof apiError === "string") {
        setError(apiError);
        return;
      }
      setError("Não foi possível salvar o cliente.");
    }
  }

  async function handleDeactivate(clientId, clientName) {
    const confirmed = confirm(
      `Deseja desativar "${clientName}"?\n\nO cliente perderá acesso ao portal mas seus dados serão mantidos.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/clients/${clientId}`);
      loadClients();
    } catch (err) {
      const apiError = err.response?.data?.detail;
      if (typeof apiError === "string") {
        setError(apiError);
        return;
      }
      setError("Não foi possível desativar o cliente.");
    }
  }

  async function handleActivate(clientId) {
    try {
      await api.put(`/clients/${clientId}`, { is_active: true });
      loadClients();
    } catch (err) {
      setError("Não foi possível reativar o cliente.");
    }
  }

  function handleEdit(client) {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingClientId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = showInactive
    ? clients
    : clients.filter((c) => c.is_active);

  return (
    <main>
      <header className="mb-10 border-b border-[#2a2a2a] pb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
          Relacionamento
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-wide">Clientes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
          Gerencie contatos, empresas e informações comerciais dos clientes.
        </p>
      </header>

      <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="h-fit border border-[#2a2a2a] bg-[#101010] p-6"
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
              {editingClientId ? "Edição" : "Cadastro"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {editingClientId ? "Atualizar cliente" : "Novo cliente"}
            </h2>
          </div>

          <div className="space-y-4">
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="name"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
                name="phone"
                placeholder="Telefone"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
                name="company"
                placeholder="Empresa"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            {/* Senha só aparece no cadastro */}
            {!editingClientId && (
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
                name="password"
                type="password"
                placeholder="Senha de acesso ao portal"
                value={form.password}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              className="bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
              type="submit"
            >
              {editingClientId ? "Atualizar cliente" : "Cadastrar cliente"}
            </button>
            {editingClientId && (
              <button
                className="border border-[#3a3320] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                type="button"
                onClick={handleCancelEdit}
              >
                Cancelar edição
              </button>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>

        {/* Lista de clientes */}
        <section className="grid gap-4 self-start">
          {/* Filtro de inativos */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className="text-xs uppercase tracking-widest text-[#9b988f] transition hover:text-[#c8a13a]"
            >
              {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
            </button>
          </div>

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
              className={`border bg-[#101010] p-6 transition ${
                client.is_active
                  ? "border-[#2a2a2a] hover:border-[#4a422d]"
                  : "border-[#2a2a2a] opacity-50"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                {/* Avatar + dados */}
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
                    <h2 className="mt-1 text-xl font-semibold">
                      {client.name}
                    </h2>
                    <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-[#9b988f] md:grid-cols-2">
                      <p>{client.email}</p>
                      <p>{client.phone || "Telefone não informado"}</p>
                      <p>{client.company || "Empresa não informada"}</p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex shrink-0 gap-3">
                  <button
                    className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                    type="button"
                    onClick={() => handleEdit(client)}
                  >
                    Editar
                  </button>
                  {client.is_active ? (
                    <button
                      className="border border-red-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-950/40"
                      type="button"
                      onClick={() => handleDeactivate(client.id, client.name)}
                    >
                      Desativar
                    </button>
                  ) : (
                    <button
                      className="border border-green-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-green-300 transition hover:bg-green-950/40"
                      type="button"
                      onClick={() => handleActivate(client.id)}
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

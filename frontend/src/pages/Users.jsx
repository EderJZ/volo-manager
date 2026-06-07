import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "editor",
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

export function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (err) {
      setError("Não foi possível carregar os usuários.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingUserId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post("/users/", form);
      }
      setForm(emptyForm);
      setEditingUserId(null);
      loadUsers();
    } catch (err) {
      const apiError = err.response?.data?.detail;
      if (typeof apiError === "string") {
        setError(apiError);
        return;
      }
      setError("Não foi possível salvar o usuário.");
    }
  }

  async function handleDelete(userId, userName) {
    const confirmed = confirm(
      `Tem certeza que deseja excluir "${userName}"?\n\nEsta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (err) {
      const apiError = err.response?.data?.detail;
      if (typeof apiError === "string") {
        setError(apiError);
        return;
      }
      setError("Não foi possível excluir o usuário.");
    }
  }

  function handleEdit(user) {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingUserId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main>
      <header className="mb-10 border-b border-[#2a2a2a] pb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
          Administração
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-wide">Usuários</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
          Gerencie os usuários com acesso ao Volo Manager.
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
              {editingUserId ? "Edição" : "Cadastro"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {editingUserId ? "Atualizar usuário" : "Novo usuário"}
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
              required={!editingUserId}
            />
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="password"
              type="password"
              placeholder={
                editingUserId ? "Nova senha (deixe vazio para manter)" : "Senha"
              }
              value={form.password}
              onChange={handleChange}
              required={!editingUserId}
            />
            <select
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="operator">Operador</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              className="bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
              type="submit"
            >
              {editingUserId ? "Atualizar usuário" : "Cadastrar usuário"}
            </button>
            {editingUserId && (
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

        {/* Lista */}
        <section className="grid gap-4 self-start">
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
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
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
                      <p className="mt-1 text-sm text-[#9b988f]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <button
                      className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                      type="button"
                      onClick={() => handleEdit(user)}
                    >
                      Editar
                    </button>
                    <button
                      className="border border-red-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-950/40"
                      type="button"
                      onClick={() => handleDelete(user.id, user.name)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

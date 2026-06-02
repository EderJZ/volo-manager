import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  status: "orcamento",
  budget: "",
  start_date: "",
  deadline: "",
  client_id: "",
};

export function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data);
    } catch (err) {
      setError("Não foi possível carregar os projetos.");
    }
  }

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

    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : null,
      client_id: Number(form.client_id),
      start_date: form.start_date || null,
      deadline: form.deadline || null,
    };

    try {
      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, payload);
      } else {
        await api.post("/projects/", payload);
      }

      setForm(emptyForm);
      setEditingProjectId(null);
      loadProjects();
    } catch (err) {
      setError("Não foi possível salvar o projeto.");
    }
  }

  async function handleDelete(projectId) {
    const confirmed = confirm("Tem certeza que deseja excluir este projeto?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      loadProjects();
    } catch (err) {
      setError("Não foi possível excluir o projeto.");
    }
  }

  function handleEdit(project) {
    setEditingProjectId(project.id);

    setForm({
      title: project.title,
      description: project.description || "",
      status: project.status,
      budget: project.budget || "",
      start_date: project.start_date || "",
      deadline: project.deadline || "",
      client_id: String(project.client_id),
    });
  }

  function handleCancelEdit() {
    setEditingProjectId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function getClientName(clientId) {
    const client = clients.find((item) => item.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  }

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  return (
    <main>
      <header className="mb-10 border-b border-[#2a2a2a] pb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
          Produção
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-wide">Projetos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
          Controle os projetos audiovisuais, status de produção, orçamento e
          prazos de entrega.
        </p>
      </header>

      <section className="grid gap-8 xl:grid-cols-[460px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit border border-[#2a2a2a] bg-[#101010] p-6"
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
              {editingProjectId ? "Edição" : "Cadastro"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {editingProjectId ? "Atualizar projeto" : "Novo projeto"}
            </h2>
          </div>

          <div className="space-y-4">
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="title"
              placeholder="Título"
              value={form.title}
              onChange={handleChange}
              required
            />
            <textarea
              className="min-h-28 w-full resize-none border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="description"
              placeholder="Descrição"
              value={form.description}
              onChange={handleChange}
            />
            <select
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="orcamento">Orçamento</option>
              <option value="aprovado">Aprovado</option>
              <option value="gravando">Gravando</option>
              <option value="em_edicao">Em edição</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <input
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              name="budget"
              type="number"
              step="0.01"
              placeholder="Orçamento"
              value={form.budget}
              onChange={handleChange}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
              />
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
            <select
              className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              className="bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#090909] transition hover:bg-[#e0bd55]"
              type="submit"
            >
              {editingProjectId ? "Atualizar projeto" : "Cadastrar projeto"}
            </button>

            {editingProjectId && (
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

        <section className="grid gap-4">
          {projects.map((project) => (
            <article
              key={project.id}
              className="border border-[#2a2a2a] bg-[#101010] p-6 transition hover:border-[#4a422d]"
            >
              <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#c8a13a]">
                    Projeto #{project.id}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {project.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9b988f]">
                    {project.description || "Sem descrição informada."}
                  </p>
                </div>

                <span className="w-fit border border-[#3a3320] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#c8a13a]">
                  {project.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid gap-4 border-t border-[#2a2a2a] pt-5 text-sm text-[#9b988f] md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Cliente
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {getClientName(project.client_id)}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Orçamento
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {Number(project.budget || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Início
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {project.start_date || "Não definido"}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs uppercase tracking-[0.18em] text-[#6f6b63]">
                    Prazo
                  </span>
                  <strong className="mt-1 block text-[#f5f1e8]">
                    {project.deadline || "Não definido"}
                  </strong>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  className="border border-[#3a3320] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#c8a13a] transition hover:bg-[#171717]"
                  type="button"
                  onClick={() => handleEdit(project)}
                >
                  Editar
                </button>

                <button
                  className="border border-red-900/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition hover:bg-red-950/40"
                  type="button"
                  onClick={() => handleDelete(project.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

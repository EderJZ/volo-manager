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
      <h1>Projetos</h1>
      <p>Gerencie os projetos audiovisuais do Volo Manager.</p>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descrição"
          value={form.description}
          onChange={handleChange}
        />

        <select
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
          name="budget"
          type="number"
          step="0.01"
          placeholder="Orçamento"
          value={form.budget}
          onChange={handleChange}
        />

        <input
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
        />

        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
        />

        <select
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

        <button type="submit">
          {editingProjectId ? "Atualizar projeto" : "Cadastrar projeto"}
        </button>

        {editingProjectId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancelar edição
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        {projects.map((project) => (
          <article key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>Cliente: {getClientName(project.client_id)}</p>
            <p>
              Orçamento:{" "}
              {Number(project.budget || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p>Início: {project.start_date || "Não definido"}</p>
            <p>Prazo: {project.deadline || "Não definido"}</p>

            <button type="button" onClick={() => handleEdit(project)}>
              Editar
            </button>

            <button type="button" onClick={() => handleDelete(project.id)}>
              Excluir
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
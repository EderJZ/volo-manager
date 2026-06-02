import { useEffect, useState } from "react";
import { api } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

export function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClientId, setEditingClientId] = useState(null);
  const [error, setError] = useState("");

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
        await api.put(`/clients/${editingClientId}`, form);
      } else {
        await api.post("/clients/", form);
      }

      setForm(emptyForm);
      setEditingClientId(null);
      loadClients();
    } catch (err) {
      setError("Não foi possível salvar o cliente.");
    }
  }

  async function handleDelete(clientId) {
    const confirmed = confirm("Tem certeza que deseja excluir este cliente?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/clients/${clientId}`);
      loadClients();
    } catch (err) {
      setError("Não foi possível excluir o cliente.");
    }
  }

  function handleEdit(client) {
    setEditingClientId(client.id);

    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
    });
  }

  function handleCancelEdit() {
    setEditingClientId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <main>
      <h1>Clientes</h1>
      <p>Gerencie os clientes cadastrados no Volo Manager.</p>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Telefone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="company"
          placeholder="Empresa"
          value={form.company}
          onChange={handleChange}
        />

        <button type="submit">
          {editingClientId ? "Atualizar cliente" : "Cadastrar cliente"}
        </button>

        {editingClientId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancelar edição
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        {clients.map((client) => (
          <article key={client.id}>
            <h2>{client.name}</h2>
            <p>{client.email}</p>
            <p>{client.phone}</p>
            <p>{client.company}</p>

            <button type="button" onClick={() => handleEdit(client)}>
              Editar
            </button>

            <button type="button" onClick={() => handleDelete(client.id)}>
              Excluir
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
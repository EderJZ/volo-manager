import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function Dashboard() {
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      setError("Não foi possível carregar o dashboard.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("volo_token");
    navigate("/login");
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <main>
        <p>{error}</p>
        <button onClick={handleLogout}>Sair</button>
      </main>
    );
  }

  if (!summary) {
    return <main>Carregando dashboard...</main>;
  }

  return (
    <main>
      <header>
        <div>
          <h1>Dashboard</h1>
          <p>Resumo geral do Volo Manager.</p>
        </div>

        <button onClick={handleLogout}>Sair</button>
      </header>

      <section>
        <article>
          <span>Clientes</span>
          <strong>{summary.total_clients}</strong>
        </article>

        <article>
          <span>Projetos</span>
          <strong>{summary.total_projects}</strong>
        </article>

        <article>
          <span>Orçamento total</span>
          <strong>
            {summary.total_budget.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
        </article>
      </section>

      <section>
        <h2>Projetos por status</h2>

        {Object.entries(summary.projects_by_status).map(([status, total]) => (
          <p key={status}>
            {status}: {total}
          </p>
        ))}
      </section>
    </main>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("eder@email.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("volo_token", response.data.access_token);

      navigate("/dashboard");
    } catch (err) {
      setError("Email ou senha inválidos.");
    }
  }

  return (
    <main>
      <h1>Volo Manager</h1>
      <p>Entre para acessar o painel.</p>

      <form onSubmit={handleLogin}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
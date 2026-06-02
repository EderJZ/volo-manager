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
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-[#f5f1e8]">
      <section className="w-full max-w-md border border-[#2a2a2a] bg-[#101010] p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c8a13a]">
            Volo Manager
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Acesso</h1>
          <p className="mt-3 text-sm leading-6 text-[#9b988f]">
            Entre para acessar o painel operacional.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-sm text-[#d9d2c0]">
            Email
            <input
              className="mt-2 w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block text-sm text-[#d9d2c0]">
            Senha
            <input
              className="mt-2 w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-[#f5f1e8] outline-none transition focus:border-[#c8a13a]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            className="w-full bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#090909] transition hover:bg-[#e0bd55]"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}

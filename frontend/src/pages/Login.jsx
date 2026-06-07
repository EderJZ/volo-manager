import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = response.data.access_token;
      localStorage.setItem("volo_token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "client") {
        navigate("/client-portal");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-[#f5f1e8]">
      {/* Marca d'água de fundo */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <p className="select-none text-[20vw] font-bold uppercase tracking-widest text-[#ffffff03]">
          Volo
        </p>
      </div>

      <section className="relative w-full max-w-md border border-[#2a2a2a] bg-[#101010] p-10">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-[#c8a13a]">
            Volo Visual
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.15em] text-[#f5f1e8]">
            Manager
          </h1>
          <div className="mx-auto mt-4 h-px w-12 bg-[#c8a13a]" />
          <p className="mt-4 text-sm text-[#9b988f]">
            Entre para acessar o painel operacional.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-xs uppercase tracking-[0.2em] text-[#9b988f]">
            Email
            <input
              className="mt-2 w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 text-sm text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="block text-xs uppercase tracking-[0.2em] text-[#9b988f]">
            Senha
            <div className="relative mt-2">
              <input
                className="w-full border border-[#2a2a2a] bg-[#171717] px-4 py-3 pr-12 text-sm text-[#f5f1e8] outline-none transition placeholder:text-[#6f6b63] focus:border-[#c8a13a]"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-[#6f6b63] transition hover:text-[#c8a13a]"
              >
                {showPassword ? "ocultar" : "ver"}
              </button>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 border border-red-900/40 bg-red-950/20 px-4 py-3">
              <span className="text-red-400">✕</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            className="w-full bg-[#c8a13a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#090909] transition hover:bg-[#e0bd55] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé */}
        <p className="mt-8 text-center text-xs text-[#6f6b63]">
          Volo Visual © {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}

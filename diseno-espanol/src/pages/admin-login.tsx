import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { useAdminSession, useLogin } from "@/lib/auth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { data: me } = useAdminSession();
  const login = useLogin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me?.authenticated) {
      setLocation("/admin");
    }
  }, [me, setLocation]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ data: { password } });
      setLocation("/admin");
    } catch (err) {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen">
      <Header adminLink={false} />
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card-vape p-8 sm:p-10 glow-neon">
          <div
            className="font-mono text-xs uppercase tracking-[0.25em] mb-2"
            style={{ color: "var(--color-ice)" }}
          >
            Acceso restringido
          </div>
          <h1
            className="font-display text-4xl mb-6 text-gradient"
            style={{ letterSpacing: "0.06em" }}
          >
            PANEL ADMIN
          </h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" data-testid="form-admin-login">
            <label className="flex flex-col gap-2">
              <span
                className="font-mono text-[0.65rem] uppercase tracking-[0.2em]"
                style={{ color: "var(--color-fog)" }}
              >
                Contraseña
              </span>
              <input
                type="password"
                className="input-vape"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                data-testid="input-password"
              />
            </label>
            {error && (
              <div
                className="font-mono text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#fca5a5",
                }}
                data-testid="text-login-error"
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-neon mt-2"
              disabled={login.isPending || !password}
              data-testid="button-submit-login"
            >
              {login.isPending ? "Verificando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

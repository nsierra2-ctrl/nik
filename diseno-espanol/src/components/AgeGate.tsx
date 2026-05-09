import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Preloader from "./Preloader";

const STORAGE_KEY = "vps_age_ok_v1";
const PRELOAD_KEY = "vps_preloaded_v1";

type Phase = "loading" | "asking" | "denied" | "preloading" | "done";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [phase, setPhase] = useState<Phase>("loading");

  // Admin pages bypass the age gate (admins are presumed adults).
  const isAdminRoute = location.startsWith("/admin");

  useEffect(() => {
    try {
      // Allow dev preview to skip the gate via ?adult=1
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("adult") === "1") {
          localStorage.setItem(STORAGE_KEY, "yes");
        }
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "yes") {
        // skip preloader on subsequent visits
        const preloaded = localStorage.getItem(PRELOAD_KEY);
        setPhase(preloaded === "yes" ? "done" : "preloading");
      } else {
        setPhase("asking");
      }
    } catch {
      setPhase("asking");
    }
  }, []);

  if (isAdminRoute) return <>{children}</>;
  if (phase === "loading") return null;

  if (phase === "denied") {
    return (
      <div
        className="fixed inset-0 z-50 grid-bg flex items-center justify-center p-6"
        style={{ background: "rgba(6,6,12,0.98)" }}
      >
        <div className="card-vape p-10 max-w-md text-center">
          <h2 className="font-display text-3xl mb-3" style={{ color: "var(--color-flame)" }}>
            ACCESO DENEGADO
          </h2>
          <p className="text-sm" style={{ color: "var(--color-fog)" }}>
            Lo sentimos, debes ser mayor de 18 años para acceder a este sitio.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "asking") {
    return (
      <div
        className="fixed inset-0 z-50 grid-bg flex items-center justify-center p-6"
        style={{ background: "rgba(6,6,12,0.98)", backdropFilter: "blur(10px)" }}
        data-testid="age-gate"
      >
        <div className="card-vape p-10 sm:p-12 max-w-lg w-full text-center glow-neon vps-modal-pop">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.4em] mb-3" style={{ color: "var(--color-ice)" }}>
            ● Bienvenido
          </div>
          <div
            className="font-display text-4xl sm:text-5xl mb-1 leading-none"
            style={{ letterSpacing: "0.18em" }}
          >
            <span className="text-gradient">VAPING</span>
          </div>
          <div
            className="font-display text-4xl sm:text-5xl mb-6 leading-none"
            style={{ letterSpacing: "0.18em" }}
          >
            <span className="text-gradient-flame">STREET</span>
          </div>
          <h2
            className="font-display text-2xl sm:text-3xl mb-4"
            style={{ color: "var(--color-neon)" }}
          >
            VERIFICACIÓN DE EDAD
          </h2>
          <p
            className="text-sm sm:text-base mb-8 leading-relaxed"
            style={{ color: "var(--color-fog)" }}
          >
            Este sitio contiene información sobre productos de vapeo. Debes tener al menos
            <strong style={{ color: "white" }}> 18 años </strong>
            para continuar.
          </p>
          <p className="font-mono text-xs uppercase tracking-widest mb-8" style={{ color: "var(--color-muted-2)" }}>
            ¿Eres mayor de 18 años?
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              type="button"
              className="btn-neon"
              data-testid="button-age-yes"
              onClick={() => {
                try {
                  localStorage.setItem(STORAGE_KEY, "yes");
                } catch {
                  /* ignore */
                }
                setPhase("preloading");
              }}
            >
              Sí, soy mayor de 18
            </button>
            <button
              type="button"
              className="btn-ghost danger"
              data-testid="button-age-no"
              onClick={() => setPhase("denied")}
            >
              No
            </button>
          </div>
          <p className="font-mono text-[0.65rem] mt-8 uppercase tracking-widest" style={{ color: "#f59e0b" }}>
            ⚠ Solo para mayores de edad · Producto controlado
          </p>
        </div>
      </div>
    );
  }

  if (phase === "preloading") {
    return (
      <Preloader
        onDone={() => {
          try {
            localStorage.setItem(PRELOAD_KEY, "yes");
          } catch {
            /* ignore */
          }
          setPhase("done");
        }}
      />
    );
  }

  return <>{children}</>;
}

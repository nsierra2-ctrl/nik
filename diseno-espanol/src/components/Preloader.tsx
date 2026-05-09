import { useEffect, useState } from "react";

export default function Preloader({
  onDone,
  duration = 2400,
}: {
  onDone: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(onDone, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onDone]);

  const pct = Math.round(progress * 100);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-ink)" }}
      data-testid="preloader"
    >
      {/* layered animated bg */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ background: "var(--color-neon)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-25 animate-pulse"
        style={{ background: "var(--color-ice)", animationDelay: "0.6s" }}
      />

      {/* smoke layers */}
      <div className="vps-smoke vps-smoke-1" />
      <div className="vps-smoke vps-smoke-2" />

      <div className="relative z-10 text-center px-6">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.5em] mb-6 vps-fade-in" style={{ color: "var(--color-ice)" }}>
          ● Bienvenido
        </div>
        <h1
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none mb-2 vps-reveal"
          style={{ letterSpacing: "0.18em" }}
        >
          <span className="text-gradient">VAPING</span>
        </h1>
        <h1
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none mb-10 vps-reveal vps-reveal-2"
          style={{ letterSpacing: "0.18em" }}
        >
          <span className="text-gradient-flame">STREET</span>
        </h1>

        <div className="w-72 mx-auto h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-150 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--color-neon), var(--color-ice))",
              boxShadow: "0 0 20px rgba(200,255,0,0.5)",
            }}
          />
        </div>
        <div
          className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.3em]"
          style={{ color: "var(--color-muted-2)" }}
          data-testid="preloader-progress"
        >
          Cargando catálogo · {pct}%
        </div>
      </div>
    </div>
  );
}

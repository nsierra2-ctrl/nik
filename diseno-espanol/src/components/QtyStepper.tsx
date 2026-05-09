import { sounds } from "@/lib/sounds";

export default function QtyStepper({
  value,
  min = 1,
  max = 9999,
  onChange,
  size = "md",
  testId,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
  testId?: string;
}) {
  const padBtn =
    size === "sm" ? "w-7 h-7 text-sm" : size === "lg" ? "w-10 h-10 text-lg" : "w-9 h-9";
  const padVal = size === "sm" ? "min-w-9 text-sm" : size === "lg" ? "min-w-14 text-xl" : "min-w-12";

  const dec = () => {
    if (value <= min) return;
    sounds.click();
    onChange(Math.max(min, value - 1));
  };
  const inc = () => {
    if (value >= max) return;
    sounds.click();
    onChange(Math.min(max, value + 1));
  };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl p-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      data-testid={testId}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={`${padBtn} rounded-lg font-display flex items-center justify-center transition-all`}
        style={{
          background: value <= min ? "transparent" : "rgba(255,69,0,0.12)",
          color: value <= min ? "var(--color-muted)" : "var(--color-flame)",
          border: "1px solid rgba(255,255,255,0.05)",
          cursor: value <= min ? "not-allowed" : "pointer",
        }}
        data-testid={testId ? `${testId}-dec` : undefined}
        aria-label="Disminuir"
      >
        −
      </button>
      <div
        className={`${padVal} text-center font-display`}
        style={{ color: "white" }}
        data-testid={testId ? `${testId}-value` : undefined}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={`${padBtn} rounded-lg font-display flex items-center justify-center transition-all`}
        style={{
          background: value >= max ? "transparent" : "rgba(200,255,0,0.12)",
          color: value >= max ? "var(--color-muted)" : "var(--color-neon)",
          border: "1px solid rgba(255,255,255,0.05)",
          cursor: value >= max ? "not-allowed" : "pointer",
        }}
        data-testid={testId ? `${testId}-inc` : undefined}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

const NF = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const NF_PLAIN = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatCop(value: number | null | undefined): string {
  if (value == null) return "—";
  return NF.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return NF_PLAIN.format(value);
}

export function parseNumberInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

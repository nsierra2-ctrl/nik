import type { CartItem } from "./cart";
import { formatCop } from "./format";

export function normalizeWaNumber(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/\D+/g, "");
}

export function buildWhatsappCheckoutUrl(args: {
  whatsapp: string | null | undefined;
  items: CartItem[];
  total: number;
  siteName?: string | null;
}): string | null {
  const num = normalizeWaNumber(args.whatsapp);
  if (!num || args.items.length === 0) return null;

  const lines: string[] = [];
  lines.push(`*PEDIDO ${args.siteName ?? "VAPING STREET"}*`);
  lines.push("");
  args.items.forEach((it, i) => {
    lines.push(`${i + 1}. *${it.productName}*`);
    if (it.variantName) lines.push(`   Variante: ${it.variantName}`);
    lines.push(`   Escala: ${it.label}`);
    lines.push(
      `   Cantidad: ${it.quantity} × ${formatCop(it.unitPrice)} = ${formatCop(it.unitPrice * it.quantity)}`,
    );
    lines.push("");
  });
  lines.push(`*TOTAL:* ${formatCop(args.total)}`);
  lines.push("");
  lines.push("Quedo atento(a) para confirmar pedido y envío. ¡Gracias!");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${num}?text=${text}`;
}

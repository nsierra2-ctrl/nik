import { useEffect, useState } from "react";
import { useGetSiteSettings } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { formatCop } from "@/lib/format";
import { buildWhatsappCheckoutUrl } from "@/lib/whatsapp";
import { resolveImageUrl } from "@/lib/storage-url";
import { sounds } from "@/lib/sounds";
import QtyStepper from "./QtyStepper";

export default function CartDrawer() {
  const { items, totalPrice, totalUnits, open, setOpen, setQty, remove, clear } = useCart();
  const { data: settings } = useGetSiteSettings();
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const wa = settings?.whatsapp ?? null;
  const checkoutUrl = buildWhatsappCheckoutUrl({
    whatsapp: wa,
    items,
    total: totalPrice,
    siteName: settings?.siteName ?? "VAPING STREET",
  });

  const handleCheckout = () => {
    if (!checkoutUrl) return;
    sounds.success();
    setCelebrating(true);
    window.setTimeout(() => {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      setCelebrating(false);
    }, 1200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(6,6,12,0.7)", backdropFilter: "blur(8px)" }}
        onClick={() => setOpen(false)}
        data-testid="cart-backdrop"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #0e0e18 0%, #06060c 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-30px 0 60px rgba(0,0,0,0.6)",
        }}
        data-testid="cart-drawer"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.25em] mb-1" style={{ color: "var(--color-ice)" }}>
              Tu pedido
            </div>
            <h2 className="font-display text-2xl text-gradient" style={{ letterSpacing: "0.06em" }}>
              CARRITO · {items.length}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-fog)",
            }}
            aria-label="Cerrar carrito"
            data-testid="button-close-cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-display text-5xl text-gradient mb-3" style={{ letterSpacing: "0.18em" }}>
                ∅
              </div>
              <div className="font-display text-xl mb-2" style={{ color: "white" }}>
                Carrito vacío
              </div>
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                Añade productos del catálogo
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((it) => {
                const imgUrl = resolveImageUrl(it.imagePath);
                const subtotal = it.unitPrice * it.quantity;
                return (
                  <div
                    key={it.id}
                    className="card-vape p-3 flex gap-3"
                    data-testid={`cart-item-${it.productSlug}`}
                  >
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.15), transparent 55%), #0a0a14",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt={it.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gradient font-display text-xs" style={{ letterSpacing: "0.1em" }}>
                          VPS
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-display text-sm leading-tight truncate" style={{ color: "white" }}>
                            {it.productName}
                          </div>
                          <div className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                            {it.variantName ? `${it.variantName} · ` : ""}
                            {it.label}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(it.id)}
                          className="text-[0.85rem] leading-none px-1.5 py-0.5"
                          style={{ color: "var(--color-flame)" }}
                          aria-label="Quitar"
                          data-testid={`button-remove-${it.productSlug}`}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <QtyStepper
                          value={it.quantity}
                          size="sm"
                          onChange={(v) => setQty(it.id, v)}
                          testId={`stepper-cart-${it.productSlug}`}
                        />
                        <div className="text-right">
                          <div className="font-display text-base" style={{ color: "var(--color-neon)" }}>
                            {formatCop(subtotal)}
                          </div>
                          <div className="font-mono text-[0.55rem] uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                            {formatCop(it.unitPrice)}/lote
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(6,6,12,0.6)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: "var(--color-muted-2)" }}>
              Total · {totalUnits} u.
            </span>
            <span className="font-display text-3xl text-gradient" data-testid="text-cart-total">
              {formatCop(totalPrice)}
            </span>
          </div>

          {!wa && (
            <div
              className="font-mono text-[0.65rem] uppercase tracking-widest p-2.5 rounded-lg text-center"
              style={{
                background: "rgba(255,69,0,0.08)",
                border: "1px solid rgba(255,69,0,0.3)",
                color: "var(--color-flame)",
              }}
            >
              ⚠ Configura WhatsApp en el panel admin
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0 || !wa || celebrating}
            className="btn-neon w-full justify-center text-sm"
            style={{
              padding: "1rem 1.4rem",
              background: celebrating
                ? "linear-gradient(135deg, var(--color-flame), var(--color-gold))"
                : undefined,
            }}
            data-testid="button-checkout-whatsapp"
          >
            {celebrating ? "✓ ABRIENDO WHATSAPP…" : "Finalizar por WhatsApp"}
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Vaciar el carrito?")) clear();
              }}
              className="font-mono text-[0.6rem] uppercase tracking-widest"
              style={{ color: "var(--color-muted-2)" }}
              data-testid="button-clear-cart"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {celebrating && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center vps-celebrate-bg">
            <div className="vps-celebrate-text font-display text-5xl text-gradient" style={{ letterSpacing: "0.18em" }}>
              ¡GRACIAS!
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

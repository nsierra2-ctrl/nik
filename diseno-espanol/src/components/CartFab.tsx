import { useCart } from "@/lib/cart";
import { sounds } from "@/lib/sounds";

export default function CartFab() {
  const { items, totalPrice, setOpen } = useCart();
  const count = items.reduce((s, it) => s + it.quantity, 0);
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={() => {
        sounds.open();
        setOpen(true);
      }}
      className="fixed z-40 bottom-6 right-6 sm:bottom-8 sm:right-8 group"
      data-testid="button-open-cart"
      aria-label="Abrir carrito"
    >
      <div
        className="flex items-center gap-3 pl-3 pr-4 py-3 rounded-2xl backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(200,255,0,0.95), rgba(0,229,255,0.95))",
          boxShadow: "0 18px 40px rgba(200,255,0,0.4), 0 0 0 1px rgba(255,255,255,0.2) inset",
          color: "var(--color-ink)",
        }}
      >
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(6,6,12,0.85)" }}>
          <span className="font-display text-lg" style={{ color: "var(--color-neon)" }}>
            ₪
          </span>
          <span
            className="absolute -top-1.5 -right-1.5 min-w-5 h-5 rounded-full px-1 text-[0.65rem] font-mono font-bold flex items-center justify-center"
            style={{ background: "var(--color-flame)", color: "white" }}
            data-testid="text-cart-count"
          >
            {count}
          </span>
        </div>
        <div className="text-left">
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] leading-none mb-0.5">
            Carrito
          </div>
          <div className="font-display text-base leading-none" data-testid="text-cart-fab-total">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totalPrice)}
          </div>
        </div>
      </div>
    </button>
  );
}

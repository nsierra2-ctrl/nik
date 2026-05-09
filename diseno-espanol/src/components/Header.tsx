import { Link } from "wouter";
import { useGetAdminMe, useGetSiteSettings } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { sounds } from "@/lib/sounds";

export default function Header({
  adminLink = true,
  showCart = true,
}: {
  adminLink?: boolean;
  showCart?: boolean;
}) {
  const { data: me } = useGetAdminMe({ query: { retry: false } });
  const { data: settings } = useGetSiteSettings();
  const { items, setOpen } = useCart();
  const cartCount = items.reduce((s, it) => s + it.quantity, 0);

  const tagline = settings?.tagline ?? "Mayorista en Colombia";

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md border-b"
      style={{
        background: "rgba(6,6,12,0.85)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" data-testid="link-home">
          <div className="flex items-baseline gap-2 cursor-pointer">
            <span
              className="font-display text-xl sm:text-3xl text-gradient"
              style={{ letterSpacing: "0.18em" }}
              data-testid="text-site-name"
            >
              VAPING
            </span>
            <span
              className="font-display text-xl sm:text-3xl text-gradient-flame"
              style={{ letterSpacing: "0.18em" }}
            >
              STREET
            </span>
            <span
              className="hidden md:inline font-mono text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: "var(--color-muted-2)" }}
            >
              · {tagline}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="#catalogo"
            className="hidden sm:inline-block font-mono text-xs uppercase tracking-[0.18em] px-2"
            style={{ color: "var(--color-fog)" }}
          >
            Catálogo
          </a>
          <a
            href="#contacto"
            className="hidden sm:inline-block font-mono text-xs uppercase tracking-[0.18em] px-2"
            style={{ color: "var(--color-fog)" }}
          >
            Contacto
          </a>
          {showCart && (
            <button
              type="button"
              onClick={() => {
                sounds.open();
                setOpen(true);
              }}
              className="relative px-3 py-2 rounded-lg font-mono text-xs uppercase tracking-[0.18em]"
              style={{
                background: "rgba(200,255,0,0.08)",
                border: "1px solid rgba(200,255,0,0.3)",
                color: "var(--color-neon)",
              }}
              data-testid="button-header-cart"
            >
              Carrito
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-5 h-5 rounded-full px-1 text-[0.6rem] font-bold flex items-center justify-center"
                  style={{ background: "var(--color-flame)", color: "white" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}
          {adminLink && (
            <Link
              href={me?.authenticated ? "/admin" : "/admin/login"}
              data-testid="link-admin"
            >
              <button type="button" className="btn-ghost">
                {me?.authenticated ? "Panel" : "Admin"}
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

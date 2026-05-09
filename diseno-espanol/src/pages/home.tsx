import { useMemo, useState } from "react";
import {
  useListProducts,
  useListCategories,
  useGetSiteSettings,
  type Product,
} from "@workspace/api-client-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";

export default function Home() {
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const { data: settings } = useGetSiteSettings();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const productList = products ?? [];
  const visibleProducts = useMemo(() => {
    if (!activeCat) return productList;
    return productList.filter((p) => p.category === activeCat);
  }, [productList, activeCat]);

  const cats = categories ?? [];

  return (
    <div className="min-h-screen relative">
      <Header />

      {settings?.announcement && (
        <div
          className="text-center py-2 text-xs font-mono tracking-[0.18em] uppercase relative z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(200,255,0,0.12), rgba(0,229,255,0.12))",
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
          data-testid="text-announcement"
        >
          {settings.announcement}
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden grid-bg noise-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-14 sm:py-24 relative z-10">
          <div className="max-w-3xl">
            <div
              className="badge-vape mb-6 inline-flex"
              style={{
                background: "rgba(0,229,255,0.08)",
                borderColor: "rgba(0,229,255,0.3)",
                color: "var(--color-ice)",
              }}
            >
              ● Distribución mayorista · Colombia
            </div>
            <h1
              className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] mb-6"
              style={{ letterSpacing: "0.04em" }}
              data-testid="text-hero-title"
            >
              <span className="text-gradient">
                {settings?.heroTitle ?? "VAPING ES UN ESTILO DE VIDA"}
              </span>
            </h1>
            <p
              className="text-base sm:text-lg max-w-2xl leading-relaxed mb-8"
              style={{ color: "var(--color-fog)" }}
              data-testid="text-hero-subtitle"
            >
              {settings?.heroSubtitle ??
                "Distribución mayorista de productos de vapeo. Cápsulas, líquidos, baterías, gomas y desechables — precios por volumen, envío nacional, atención directa."}
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#catalogo" className="btn-neon">
                Ver catálogo
              </a>
              <a href="#contacto" className="btn-ghost">
                Contacto mayorista
              </a>
            </div>
          </div>
        </div>
        <div
          className="absolute right-[-100px] top-[-100px] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-neon)" }}
        />
        <div
          className="absolute left-[-150px] bottom-[-150px] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--color-ice)" }}
        />
      </section>

      {/* CATÁLOGO */}
      <section
        id="catalogo"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 py-14 sm:py-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div
              className="font-mono text-xs uppercase tracking-[0.25em] mb-2"
              style={{ color: "var(--color-ice)" }}
            >
              Catálogo
            </div>
            <h2 className="font-display text-4xl sm:text-5xl">
              <span style={{ color: "white" }}>{productList.length} </span>
              <span className="text-gradient">PRODUCTOS</span>
            </h2>
          </div>
          <p
            className="font-mono text-xs uppercase tracking-[0.18em] max-w-md"
            style={{ color: "var(--color-muted-2)" }}
          >
            Precios por volumen · Stock disponible · Envíos nacionales
          </p>
        </div>

        <div
          className="flex gap-2 flex-wrap mb-8 sm:mb-10"
          data-testid="filter-categories"
        >
          <button
            type="button"
            className={`chip ${activeCat == null ? "active" : ""}`}
            onClick={() => setActiveCat(null)}
            data-testid="chip-all"
          >
            Todos · {productList.length}
          </button>
          {cats.map((c) => {
            const count = productList.filter((p) => p.category === c.slug).length;
            return (
              <button
                key={c.slug}
                type="button"
                className={`chip ${activeCat === c.slug ? "active" : ""}`}
                onClick={() => setActiveCat(c.slug)}
                data-testid={`chip-cat-${c.slug}`}
              >
                {c.name} · {count}
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div
            className="text-center py-20 font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--color-muted-2)" }}
          >
            Cargando catálogo…
          </div>
        )}

        {!isLoading && visibleProducts.length === 0 && (
          <div
            className="text-center py-20 font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--color-muted-2)" }}
          >
            No hay productos en esta categoría aún.
          </div>
        )}

        <div
          className="grid gap-4 sm:gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setOpenProduct} />
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr] items-start">
            <div>
              <div
                className="font-mono text-xs uppercase tracking-[0.25em] mb-2"
                style={{ color: "var(--color-ice)" }}
              >
                Contacto mayorista
              </div>
              <h2 className="font-display text-4xl sm:text-5xl mb-4">
                <span className="text-gradient">HABLEMOS</span>
              </h2>
              <p style={{ color: "var(--color-fog)" }} className="mb-6">
                Atención directa para distribuidores y clientes mayoristas en toda
                Colombia. Negociamos litro y volúmenes especiales bajo pedido.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="card-vape p-5 hover:glow-neon"
                  data-testid="link-whatsapp"
                >
                  <div
                    className="font-mono text-[0.65rem] uppercase tracking-[0.2em] mb-2"
                    style={{ color: "var(--color-neon)" }}
                  >
                    WhatsApp
                  </div>
                  <div className="font-display text-xl break-all">
                    {settings.whatsapp}
                  </div>
                </a>
              )}
              {settings?.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="card-vape p-5"
                  data-testid="link-instagram"
                >
                  <div
                    className="font-mono text-[0.65rem] uppercase tracking-[0.2em] mb-2"
                    style={{ color: "var(--color-ice)" }}
                  >
                    Instagram
                  </div>
                  <div className="font-display text-xl break-all">
                    @{settings.instagram.replace(/^@/, "")}
                  </div>
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="card-vape p-5"
                  data-testid="link-email"
                >
                  <div
                    className="font-mono text-[0.65rem] uppercase tracking-[0.2em] mb-2"
                    style={{ color: "var(--color-gold)" }}
                  >
                    Email
                  </div>
                  <div className="font-display text-xl break-all">
                    {settings.email}
                  </div>
                </a>
              )}
              {!settings?.whatsapp &&
                !settings?.instagram &&
                !settings?.email && (
                  <div
                    className="card-vape p-5 sm:col-span-3 text-center"
                    style={{ color: "var(--color-muted-2)" }}
                  >
                    <div className="font-mono text-xs uppercase tracking-widest">
                      Configura tus datos de contacto desde el panel admin.
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      <footer
        className="border-t py-8"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          background: "var(--color-smoke)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div
            className="font-display text-2xl"
            style={{ letterSpacing: "0.18em" }}
          >
            <span className="text-gradient">VAPING</span>{" "}
            <span className="text-gradient-flame">STREET</span>
          </div>
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em]"
            style={{ color: "var(--color-muted-2)" }}
          >
            © {new Date().getFullYear()} · Solo +18 · Producto controlado
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={openProduct}
        onClose={() => setOpenProduct(null)}
      />
    </div>
  );
}

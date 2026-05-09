import type { Product } from "@workspace/api-client-react";
import { formatCop } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const variants = product.variants ?? [];
  const tiers = product.tiers ?? [];
  const firstVariant = variants[0];
  const retail =
    firstVariant?.retailPrice ?? product.retailPrice ?? null;
  const lowestTier =
    (firstVariant?.tiers ?? tiers).reduce<{ unit: number } | null>((acc, t) => {
      if (!acc || t.unitPrice < acc.unit) return { unit: t.unitPrice };
      return acc;
    }, null);

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="card-vape overflow-hidden flex flex-col group text-left w-full vps-card-hover"
      data-testid={`card-product-${product.slug}`}
    >
      <div className="relative aspect-[4/3] scanline-anim overflow-hidden">
        <ProductImage
          imagePath={product.imagePath}
          alt={product.name}
          className="h-full transition-transform duration-700 group-hover:scale-110"
          testId={`img-${product.slug}`}
          cacheBust={product.updatedAt ?? null}
        />
        {product.badge && (
          <div
            className="absolute top-3 left-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(6,6,12,0.85)",
              border: "1px solid rgba(200,255,0,0.5)",
              color: "var(--color-neon)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.badge}
          </div>
        )}
        {product.thcPercent && (
          <div
            className="absolute top-3 right-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(6,6,12,0.85)",
              border: "1px solid rgba(0,229,255,0.5)",
              color: "var(--color-ice)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.thcPercent} THC
          </div>
        )}

        {/* hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(180deg, transparent 30%, rgba(6,6,12,0.85) 100%)" }}
        >
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.25em] px-3 py-1.5 rounded-md"
            style={{
              background: "rgba(200,255,0,0.95)",
              color: "var(--color-ink)",
              fontWeight: 700,
            }}
          >
            ⤢ Ver opciones
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3
            className="font-display text-xl sm:text-2xl leading-tight mb-1 line-clamp-2"
            style={{ color: "white", letterSpacing: "0.05em" }}
            data-testid={`text-name-${product.slug}`}
          >
            {product.name}
          </h3>
          {product.shortDescription && (
            <p
              className="text-xs sm:text-sm line-clamp-2"
              style={{ color: "var(--color-fog)" }}
              data-testid={`text-short-${product.slug}`}
            >
              {product.shortDescription}
            </p>
          )}
        </div>

        <div
          className="grid grid-cols-2 gap-2 mt-auto pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <div className="font-mono text-[0.55rem] uppercase tracking-[0.2em] mb-0.5" style={{ color: "var(--color-muted-2)" }}>
              Detal
            </div>
            <div
              className="font-display text-lg leading-none"
              style={{ color: retail != null ? "var(--color-neon)" : "var(--color-muted)" }}
              data-testid={`text-retail-${product.slug}`}
            >
              {retail != null ? formatCop(retail) : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[0.55rem] uppercase tracking-[0.2em] mb-0.5" style={{ color: "var(--color-muted-2)" }}>
              Mayor desde
            </div>
            <div
              className="font-display text-lg leading-none"
              style={{ color: lowestTier ? "var(--color-ice)" : "var(--color-muted)" }}
              data-testid={`text-lowest-${product.slug}`}
            >
              {lowestTier ? `${formatCop(lowestTier.unit)}/u` : "—"}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
          style={{ color: "var(--color-muted-2)" }}
        >
          <span>
            {variants.length > 0
              ? `${variants.length} variantes`
              : `${tiers.length} escalas`}
          </span>
          <span style={{ color: "var(--color-ice)" }}>+ Comprar →</span>
        </div>
      </div>
    </button>
  );
}

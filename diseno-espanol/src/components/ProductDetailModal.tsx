import { useEffect, useMemo, useState } from "react";
import type { Product } from "@workspace/api-client-react";
import { resolveImageUrl } from "@/lib/storage-url";
import { formatCop } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { sounds } from "@/lib/sounds";
import QtyStepper from "./QtyStepper";

type Choice =
  | { kind: "retail"; price: number; label: string; unitsPerLot: 1 }
  | { kind: "tier"; index: number; price: number; label: string; unitsPerLot: number };

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { add, setOpen: setCartOpen } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const [choiceKey, setChoiceKey] = useState<string>("retail");
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [added, setAdded] = useState(false);

  // reset state when product changes
  useEffect(() => {
    if (!product) return;
    setVariantIdx(0);
    setChoiceKey("retail");
    setQty(1);
    setZoomed(false);
    setAdded(false);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) setZoomed(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose, zoomed]);

  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;
  const activeVariant = hasVariants ? variants[variantIdx] : null;

  const tiers = useMemo(
    () => (activeVariant ? activeVariant.tiers ?? [] : product?.tiers ?? []),
    [activeVariant, product],
  );
  const retail = activeVariant?.retailPrice ?? product?.retailPrice ?? null;
  const retailLabel = activeVariant?.retailLabel ?? product?.retailLabel ?? "1 unidad";

  // Pick a sensible default choice when variant changes
  useEffect(() => {
    if (retail != null) setChoiceKey("retail");
    else if (tiers.length > 0) setChoiceKey("tier-0");
    setQty(1);
  }, [retail, tiers]);

  const choices: Choice[] = useMemo(() => {
    const list: Choice[] = [];
    if (retail != null) {
      list.push({
        kind: "retail",
        price: retail,
        label: retailLabel ?? "1 unidad",
        unitsPerLot: 1,
      });
    }
    tiers.forEach((t, i) => {
      list.push({
        kind: "tier",
        index: i,
        price: t.totalPrice ?? t.unitPrice * t.quantity,
        label: t.label,
        unitsPerLot: t.quantity,
      });
    });
    return list;
  }, [retail, retailLabel, tiers]);

  const activeChoice =
    choices.find((c) =>
      c.kind === "retail" ? choiceKey === "retail" : `tier-${c.index}` === choiceKey,
    ) ?? choices[0];

  const subtotal = (activeChoice?.price ?? 0) * qty;

  if (!product) return null;
  const imgUrl = resolveImageUrl(product.imagePath, { cacheBust: product.updatedAt ?? null });

  const handleAdd = () => {
    if (!activeChoice) return;
    add({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imagePath: product.imagePath ?? null,
      variantName: activeVariant?.name,
      mode: activeChoice.kind,
      label: activeChoice.label,
      unitsPerLot: activeChoice.unitsPerLot,
      unitPrice: activeChoice.price,
      quantity: qty,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
  };

  const handleAddAndOpenCart = () => {
    handleAdd();
    window.setTimeout(() => {
      onClose();
      setCartOpen(true);
    }, 350);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 vps-modal-enter"
        style={{ background: "rgba(6,6,12,0.75)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
        data-testid="product-modal-backdrop"
      >
        <div
          className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto card-vape rounded-t-3xl sm:rounded-3xl vps-modal-pop"
          onClick={(e) => e.stopPropagation()}
          data-testid={`product-modal-${product.slug}`}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(6,6,12,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              backdropFilter: "blur(6px)",
            }}
            aria-label="Cerrar"
            data-testid="button-close-modal"
          >
            ✕
          </button>

          <div className="grid sm:grid-cols-[1.1fr_1fr] gap-0">
            {/* Image area */}
            <div
              className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[420px] cursor-zoom-in scanline-anim"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(200,255,0,0.15), transparent 55%), radial-gradient(circle at 70% 80%, rgba(0,229,255,0.12), transparent 55%), #0a0a14",
              }}
              onClick={() => imgUrl && setZoomed(true)}
              data-testid={`modal-img-${product.slug}`}
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid-bg flex items-center justify-center">
                  <div className="text-center px-4">
                    <div
                      className="font-display text-6xl text-gradient leading-none mb-2"
                      style={{ letterSpacing: "0.18em" }}
                    >
                      VPS
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-muted-2)" }}>
                      {product.name}
                    </div>
                  </div>
                </div>
              )}
              {imgUrl && (
                <div
                  className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md font-mono text-[0.6rem] uppercase tracking-widest"
                  style={{
                    background: "rgba(6,6,12,0.85)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "var(--color-fog)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ⤢ Click para ampliar
                </div>
              )}
              {product.badge && (
                <div
                  className="absolute top-4 left-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] font-bold px-3 py-1.5 rounded-md"
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
                  className="absolute top-4 left-4 mt-9 font-mono text-[0.65rem] uppercase tracking-[0.18em] font-bold px-3 py-1.5 rounded-md"
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
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 flex flex-col gap-4">
              <div>
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.25em] mb-1.5" style={{ color: "var(--color-ice)" }}>
                  {product.category}
                </div>
                <h2
                  className="font-display text-3xl sm:text-4xl leading-tight"
                  style={{ color: "white", letterSpacing: "0.04em" }}
                  data-testid={`modal-name-${product.slug}`}
                >
                  {product.name}
                </h2>
                {product.shortDescription && (
                  <p className="text-sm mt-2" style={{ color: "var(--color-fog)" }}>
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-[0.85rem] leading-relaxed" style={{ color: "var(--color-fog)" }}>
                  {product.description}
                </p>
              )}

              {hasVariants && variants.length > 1 && (
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--color-muted-2)" }}>
                    Variante
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {variants.map((v, i) => (
                      <button
                        key={`${v.name}-${i}`}
                        type="button"
                        onClick={() => {
                          sounds.click();
                          setVariantIdx(i);
                        }}
                        className={`chip ${i === variantIdx ? "active" : ""}`}
                        data-testid={`modal-variant-${product.slug}-${i}`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price options */}
              {choices.length === 0 ? (
                <div
                  className="p-4 rounded-xl text-center font-mono text-xs uppercase tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                    color: "var(--color-muted-2)",
                  }}
                >
                  Precio por consultar
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: "var(--color-ice)" }}>
                    Elige escala
                  </div>
                  <div className="grid gap-1.5">
                    {choices.map((c, i) => {
                      const key = c.kind === "retail" ? "retail" : `tier-${c.index}`;
                      const isActive = key === choiceKey;
                      return (
                        <button
                          key={`${key}-${i}`}
                          type="button"
                          onClick={() => {
                            sounds.click();
                            setChoiceKey(key);
                            setQty(1);
                          }}
                          className="text-left grid grid-cols-[1fr_auto] gap-3 items-center px-3.5 py-2.5 rounded-xl transition-all"
                          style={{
                            background: isActive
                              ? "rgba(200,255,0,0.1)"
                              : "rgba(255,255,255,0.03)",
                            border: isActive
                              ? "1px solid rgba(200,255,0,0.6)"
                              : "1px solid rgba(255,255,255,0.06)",
                            boxShadow: isActive ? "0 6px 24px rgba(200,255,0,0.12)" : undefined,
                          }}
                          data-testid={`modal-choice-${product.slug}-${key}`}
                        >
                          <div>
                            <div className="font-mono text-[0.7rem] uppercase tracking-wider" style={{ color: isActive ? "var(--color-neon)" : "var(--color-fog)" }}>
                              {c.kind === "retail" ? "Al detal" : "Mayorista"} · {c.label}
                            </div>
                            <div className="font-mono text-[0.6rem] uppercase tracking-widest mt-0.5" style={{ color: "var(--color-muted-2)" }}>
                              {c.kind === "retail"
                                ? `${formatCop(c.price)} por unidad`
                                : `${formatCop(c.price / c.unitsPerLot)}/u · lote ${c.unitsPerLot} u.`}
                            </div>
                          </div>
                          <div className="font-display text-xl" style={{ color: isActive ? "var(--color-neon)" : "white" }}>
                            {formatCop(c.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Qty + add */}
              {activeChoice && (
                <div
                  className="flex flex-col gap-3 p-4 rounded-2xl mt-1"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: "var(--color-muted-2)" }}>
                        Cantidad de lotes
                      </div>
                      <div className="font-mono text-[0.65rem]" style={{ color: "var(--color-fog)" }}>
                        {qty * activeChoice.unitsPerLot} unidades totales
                      </div>
                    </div>
                    <QtyStepper
                      value={qty}
                      onChange={setQty}
                      size="lg"
                      testId={`modal-qty-${product.slug}`}
                    />
                  </div>
                  <div className="flex items-baseline justify-between border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]" style={{ color: "var(--color-muted-2)" }}>
                      Subtotal
                    </span>
                    <span className="font-display text-3xl text-gradient" data-testid={`modal-subtotal-${product.slug}`}>
                      {formatCop(subtotal)}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="btn-ghost w-full justify-center"
                      data-testid={`modal-add-${product.slug}`}
                    >
                      {added ? "✓ Añadido" : "Añadir al carrito"}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAndOpenCart}
                      className="btn-neon w-full justify-center"
                      data-testid={`modal-add-and-cart-${product.slug}`}
                    >
                      Añadir + ver carrito
                    </button>
                  </div>
                </div>
              )}

              {product.notes && (
                <p
                  className="font-mono text-[0.7rem] leading-relaxed"
                  style={{ color: "var(--color-muted-2)" }}
                >
                  * {product.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image zoom overlay */}
      {zoomed && imgUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 cursor-zoom-out vps-modal-enter"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setZoomed(false)}
          data-testid={`zoom-img-${product.slug}`}
        >
          <img
            src={imgUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-xl vps-modal-pop"
            style={{ boxShadow: "0 0 80px rgba(200,255,0,0.2)" }}
          />
          <button
            type="button"
            className="absolute top-5 right-5 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(6,6,12,0.85)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "white",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(false);
            }}
            aria-label="Cerrar zoom"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

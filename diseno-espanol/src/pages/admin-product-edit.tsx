import { useEffect, useState, useCallback } from "react";
import { useLocation, useRoute, Link } from "wouter";
import {
  useAdminListProducts,
  useAdminUpdateProduct,
  useListCategories,
  useRequestUploadUrl,
  getAdminListProductsQueryKey,
  getListProductsQueryKey,
  getGetProductQueryKey,
} from "@workspace/api-client-react";
import type { Product, PriceTier, ProductVariant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@workspace/object-storage-web";
import Header from "@/components/Header";
import ProductImage from "@/components/ProductImage";
import { useAdminSession } from "@/lib/auth";
import { formatCop, parseNumberInput } from "@/lib/format";

type Draft = {
  name: string;
  slug: string;
  category: string;
  badge: string;
  shortDescription: string;
  description: string;
  retailPrice: string;
  retailLabel: string;
  unit: string;
  thcPercent: string;
  notes: string;
  sortOrder: string;
  active: boolean;
  imagePath: string;
  variants: ProductVariant[];
  tiers: PriceTier[];
};

function productToDraft(p: Product): Draft {
  return {
    name: p.name,
    slug: p.slug,
    category: p.category,
    badge: p.badge ?? "",
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    retailPrice: p.retailPrice != null ? String(p.retailPrice) : "",
    retailLabel: p.retailLabel ?? "",
    unit: p.unit ?? "",
    thcPercent: p.thcPercent ?? "",
    notes: p.notes ?? "",
    sortOrder: String(p.sortOrder ?? 0),
    active: p.active ?? true,
    imagePath: p.imagePath ?? "",
    variants: (p.variants ?? []).map((v) => ({
      name: v.name,
      retailPrice: v.retailPrice ?? null,
      retailLabel: v.retailLabel ?? null,
      tiers: v.tiers.map((t) => ({ ...t })),
    })),
    tiers: (p.tiers ?? []).map((t) => ({ ...t })),
  };
}

export default function AdminProductEdit() {
  const [, params] = useRoute<{ id: string }>("/admin/products/:id");
  const [, setLocation] = useLocation();
  const { data: me, isLoading: meLoading } = useAdminSession();

  useEffect(() => {
    if (!meLoading && !me?.authenticated) {
      setLocation("/admin/login");
    }
  }, [me, meLoading, setLocation]);

  const productId = params?.id;
  const { data: products, isLoading } = useAdminListProducts();
  const product = products?.find((p) => p.id === productId);

  if (meLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "var(--color-neon)", borderRightColor: "var(--color-ice)" }}
          />
          Cargando…
        </div>
      </div>
    );
  }

  if (!me?.authenticated) return null;

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header adminLink={false} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4 text-gradient">Producto no encontrado</h1>
          <Link href="/admin">
            <button type="button" className="btn-neon">Volver al panel</button>
          </Link>
        </div>
      </div>
    );
  }

  return <ProductEditor product={product} allProducts={products ?? []} />;
}

function ProductEditor({ product, allProducts }: { product: Product; allProducts: Product[] }) {
  const qc = useQueryClient();
  const update = useAdminUpdateProduct();
  const requestUpload = useRequestUploadUrl();
  const { data: categories } = useListCategories();

  const [draft, setDraft] = useState<Draft>(() => productToDraft(product));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "precios" | "variantes">("info");

  useEffect(() => {
    setDraft(productToDraft(product));
  }, [product.id]);

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  // FIX: useCallback para que invalidate no sea nueva referencia en cada render
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetProductQueryKey(product.id) });
  }, [qc, product.id]);

  const handleSave = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: product.id,
        data: {
          name: draft.name,
          slug: draft.slug,
          category: draft.category,
          badge: draft.badge || null,
          shortDescription: draft.shortDescription || null,
          description: draft.description || null,
          retailPrice: parseNumberInput(draft.retailPrice),
          retailLabel: draft.retailLabel || null,
          unit: draft.unit || null,
          thcPercent: draft.thcPercent || null,
          notes: draft.notes || null,
          sortOrder: parseNumberInput(draft.sortOrder) ?? 999,
          active: draft.active,
          imagePath: draft.imagePath || null,
          variants: draft.variants,
          tiers: draft.tiers,
        },
      });
      invalidate();
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar";
      setError(msg);
    }
  };

  // FIX: useCallback para que persistImage no sea nueva referencia en cada render.
  // Esto evita que ObjectUploader (Uppy) detecte un prop nuevo y se desmonte/remonte
  // en bucle cada vez que update.isPending cambia.
  const persistImage = useCallback(async (newPath: string) => {
    try {
      setDraft((d) => ({ ...d, imagePath: newPath }));
      await update.mutateAsync({
        id: product.id,
        data: { imagePath: newPath },
      });
      invalidate();
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar imagen";
      setError(msg);
    }
  }, [product.id, update, invalidate]);

  // FIX: useCallback para que handleImageUpload sea referencia estable
  const handleImageUpload = useCallback(async (uploadedUrl: string) => {
    const u = new URL(uploadedUrl);
    const objectPath = u.pathname.split("/").slice(-1)[0];
    const newPath = `/objects/uploads/${objectPath}`;
    await persistImage(newPath);
  }, [persistImage]);

  // FIX: useCallback para los dos callbacks que se pasan a ObjectUploader.
  // Si son funciones inline (nuevas en cada render), Uppy las trata como
  // props distintas → desmonta y remonta el plugin → bucle de crash.
  const handleGetUploadParameters = useCallback(async (file: File) => {
    const res = await requestUpload.mutateAsync({
      data: {
        name: String(file.name ?? "image"),
        size: Number(file.size ?? 0),
        contentType: String(file.type ?? "application/octet-stream"),
      },
    });
    return { method: "PUT" as const, url: res.uploadURL };
  }, [requestUpload]);

  const handleUploadComplete = useCallback((result: { successful?: Array<{ uploadURL?: string }> }) => {
    const successful = result.successful?.[0];
    if (successful?.uploadURL) {
      void handleImageUpload(successful.uploadURL);
    }
  }, [handleImageUpload]);

  const addTier = () => {
    setField("tiers", [
      ...draft.tiers,
      { label: "Nueva escala", quantity: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const updateTier = (idx: number, patch: Partial<PriceTier>) => {
    const next = draft.tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    const updated = next.map((t) => ({ ...t, totalPrice: t.quantity * t.unitPrice }));
    setField("tiers", updated);
  };

  const removeTier = (idx: number) => {
    setField("tiers", draft.tiers.filter((_, i) => i !== idx));
  };

  const addVariant = () => {
    setField("variants", [
      ...draft.variants,
      { name: "Nueva variante", retailPrice: null, retailLabel: "1 unidad", tiers: [] },
    ]);
  };

  const updateVariant = (idx: number, patch: Partial<ProductVariant>) => {
    setField(
      "variants",
      draft.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    );
  };

  const removeVariant = (idx: number) => {
    setField("variants", draft.variants.filter((_, i) => i !== idx));
  };

  const addVariantTier = (vIdx: number) => {
    const v = draft.variants[vIdx];
    updateVariant(vIdx, {
      tiers: [
        ...v.tiers,
        { label: "Nueva escala", quantity: 1, unitPrice: 0, totalPrice: 0 },
      ],
    });
  };

  const updateVariantTier = (vIdx: number, tIdx: number, patch: Partial<PriceTier>) => {
    const v = draft.variants[vIdx];
    const next = v.tiers.map((t, i) => (i === tIdx ? { ...t, ...patch } : t));
    const updated = next.map((t) => ({ ...t, totalPrice: t.quantity * t.unitPrice }));
    updateVariant(vIdx, { tiers: updated });
  };

  const removeVariantTier = (vIdx: number, tIdx: number) => {
    const v = draft.variants[vIdx];
    updateVariant(vIdx, { tiers: v.tiers.filter((_, i) => i !== tIdx) });
  };

  const tabs = [
    { id: "info" as const, label: "Info básica" },
    { id: "precios" as const, label: `Precios · ${draft.tiers.length} escalas` },
    { id: "variantes" as const, label: `Variantes · ${draft.variants.length}` },
  ];

  return (
    <div className="min-h-screen">
      <Header adminLink={false} />

      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{
          background: "rgba(6,6,12,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin">
            <button type="button" className="btn-ghost" style={{ padding: "0.5rem 1rem" }}>
              ← Panel
            </button>
          </Link>
          <div className="min-w-0">
            <div className="font-display text-lg leading-none truncate" style={{ color: "white", letterSpacing: "0.06em" }}>
              {draft.name || "Sin nombre"}
            </div>
            <div className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
              {draft.category} · {draft.active ? (
                <span style={{ color: "var(--color-neon)" }}>Activo</span>
              ) : (
                <span style={{ color: "#fca5a5" }}>Oculto</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {savedAt && (
            <span
              className="font-mono text-[0.65rem] uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: "var(--color-neon)" }}
              data-testid="text-saved"
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--color-neon)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--color-neon)",
              }} />
              Guardado
            </span>
          )}
          <button
            type="button"
            className="btn-neon"
            onClick={handleSave}
            disabled={update.isPending}
            data-testid="button-save-product"
            style={{ padding: "0.6rem 1.4rem" }}
          >
            {update.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div
            className="mb-5 p-4 rounded-xl font-mono text-xs flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}
            data-testid="text-product-error"
          >
            <span style={{ flexShrink: 0 }}>⚠</span>
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* LEFT: IMAGE PANEL */}
          <div className="flex flex-col gap-4">
            <div className="card-vape p-4 flex flex-col gap-4">
              {/* Preview */}
              <div
                className="aspect-square rounded-xl overflow-hidden relative"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ProductImage
                  imagePath={draft.imagePath}
                  alt={draft.name}
                  className="h-full"
                  testId="img-edit-preview"
                  cacheBust={savedAt ?? product.updatedAt ?? null}
                />
                {draft.imagePath && (
                  <div
                    className="absolute top-2 right-2 font-mono text-[0.55rem] uppercase tracking-widest px-2 py-1 rounded-md"
                    style={{
                      background: "rgba(6,6,12,0.85)",
                      border: "1px solid rgba(200,255,0,0.4)",
                      color: "var(--color-neon)",
                    }}
                  >
                    ✓ Imagen
                  </div>
                )}
              </div>

              {/* Upload button — FIX: callbacks memoizados, no inline */}
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={20 * 1024 * 1024}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="btn-neon"
              >
                {draft.imagePath ? "↑ Cambiar imagen" : "↑ Subir imagen"}
              </ObjectUploader>

              {draft.imagePath && (
                <button
                  type="button"
                  className="btn-ghost danger"
                  onClick={() => persistImage("")}
                  data-testid="button-remove-image"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Quitar imagen
                </button>
              )}

              <ImageGalleryPicker
                products={allProducts}
                currentId={product.id}
                currentPath={draft.imagePath}
                onPick={persistImage}
              />
            </div>

            {/* Quick meta card */}
            <div className="card-vape p-4">
              <div className="font-mono text-[0.6rem] uppercase tracking-widest mb-3" style={{ color: "var(--color-ice)" }}>
                Configuración rápida
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Orden">
                  <input
                    className="input-vape"
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => setField("sortOrder", e.target.value)}
                    data-testid="input-sort"
                  />
                </Field>
                <Field label="Estado">
                  <select
                    className="input-vape"
                    value={draft.active ? "yes" : "no"}
                    onChange={(e) => setField("active", e.target.value === "yes")}
                    data-testid="select-active"
                  >
                    <option value="yes">✓ Activo</option>
                    <option value="no">✕ Oculto</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* RIGHT: TABS + FORM */}
          <div className="flex flex-col gap-0">
            {/* Tab nav */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] py-2.5 px-3 rounded-lg transition-all duration-200"
                  style={
                    activeTab === tab.id
                      ? {
                          background: "linear-gradient(135deg, rgba(200,255,0,0.15), rgba(0,229,255,0.1))",
                          color: "var(--color-neon)",
                          border: "1px solid rgba(200,255,0,0.25)",
                        }
                      : { color: "var(--color-muted-2)", border: "1px solid transparent" }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Info básica */}
            {activeTab === "info" && (
              <div className="card-vape p-5">
                <h2 className="font-display text-xl mb-5" style={{ color: "white", letterSpacing: "0.06em" }}>
                  Información del producto
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre" full>
                    <input
                      className="input-vape"
                      value={draft.name}
                      onChange={(e) => setField("name", e.target.value)}
                      data-testid="input-name"
                    />
                  </Field>
                  <Field label="Slug (URL)">
                    <input
                      className="input-vape"
                      value={draft.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      data-testid="input-slug"
                    />
                  </Field>
                  <Field label="Categoría">
                    <select
                      className="input-vape"
                      value={draft.category}
                      onChange={(e) => setField("category", e.target.value)}
                      data-testid="select-category"
                    >
                      {(categories ?? []).map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Badge (etiqueta)">
                    <input
                      className="input-vape"
                      value={draft.badge}
                      placeholder="PREMIUM, BEST SELLER…"
                      onChange={(e) => setField("badge", e.target.value)}
                      data-testid="input-badge"
                    />
                  </Field>
                  <Field label="THC %">
                    <input
                      className="input-vape"
                      value={draft.thcPercent}
                      placeholder="96.487%"
                      onChange={(e) => setField("thcPercent", e.target.value)}
                      data-testid="input-thc"
                    />
                  </Field>
                  <Field label="Descripción corta" full>
                    <input
                      className="input-vape"
                      value={draft.shortDescription}
                      onChange={(e) => setField("shortDescription", e.target.value)}
                      data-testid="input-short"
                    />
                  </Field>
                  <Field label="Descripción larga" full>
                    <textarea
                      className="input-vape"
                      rows={4}
                      value={draft.description}
                      onChange={(e) => setField("description", e.target.value)}
                      data-testid="input-description"
                    />
                  </Field>
                  <Field label="Notas (asterisco)" full>
                    <input
                      className="input-vape"
                      value={draft.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      data-testid="input-notes"
                    />
                  </Field>
                </div>

                {/* Precio detal inline */}
                <div
                  className="mt-6 pt-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <h3 className="font-display text-lg mb-4" style={{ color: "var(--color-neon)", letterSpacing: "0.08em" }}>
                    Precio al detal
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Precio (COP)">
                      <input
                        className="input-vape"
                        inputMode="numeric"
                        value={draft.retailPrice}
                        placeholder="60000"
                        onChange={(e) => setField("retailPrice", e.target.value)}
                        data-testid="input-retail-price"
                      />
                    </Field>
                    <Field label="Etiqueta">
                      <input
                        className="input-vape"
                        value={draft.retailLabel}
                        placeholder="1 unidad"
                        onChange={(e) => setField("retailLabel", e.target.value)}
                        data-testid="input-retail-label"
                      />
                    </Field>
                    <Field label="Unidad">
                      <input
                        className="input-vape"
                        value={draft.unit}
                        placeholder="unidad / ml / paquete"
                        onChange={(e) => setField("unit", e.target.value)}
                        data-testid="input-unit"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Precios / Escalas */}
            {activeTab === "precios" && (
              <div className="card-vape p-5">
                <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="font-display text-xl" style={{ color: "white", letterSpacing: "0.06em" }}>
                      Escalas mayoristas
                    </h2>
                    <p className="font-mono text-xs mt-1 uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                      Cantidad · precio unitario · total automático
                    </p>
                  </div>
                  <button type="button" className="btn-neon" onClick={addTier} data-testid="button-add-tier">
                    + Escala
                  </button>
                </div>

                {draft.tiers.length === 0 ? (
                  <div
                    className="py-12 text-center rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
                  >
                    <div className="font-display text-2xl mb-2" style={{ color: "var(--color-muted)", letterSpacing: "0.1em" }}>
                      SIN ESCALAS
                    </div>
                    <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                      Añade escalas de precio mayorista para este producto
                    </p>
                    <button type="button" className="btn-neon mt-4" onClick={addTier}>
                      + Agregar primera escala
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="hidden sm:grid gap-2 mb-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] px-1"
                      style={{ gridTemplateColumns: "1.4fr 0.7fr 1fr 1fr auto", color: "var(--color-muted-2)" }}
                    >
                      <span>Etiqueta</span>
                      <span>Cantidad</span>
                      <span>Precio/u</span>
                      <span>Total</span>
                      <span />
                    </div>
                    <TierRows
                      tiers={draft.tiers}
                      onChange={updateTier}
                      onRemove={removeTier}
                      testIdPrefix="root"
                    />
                  </>
                )}
              </div>
            )}

            {/* TAB: Variantes */}
            {activeTab === "variantes" && (
              <div className="card-vape p-5">
                <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="font-display text-xl" style={{ color: "white", letterSpacing: "0.06em" }}>
                      Variantes
                    </h2>
                    <p className="font-mono text-xs mt-1 uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                      Para sub-opciones: Nacional, Delta 9, Clear…
                    </p>
                  </div>
                  <button type="button" className="btn-neon" onClick={addVariant} data-testid="button-add-variant">
                    + Variante
                  </button>
                </div>

                {draft.variants.length === 0 ? (
                  <div
                    className="py-12 text-center rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
                  >
                    <div className="font-display text-2xl mb-2" style={{ color: "var(--color-muted)", letterSpacing: "0.1em" }}>
                      SIN VARIANTES
                    </div>
                    <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                      Usa las escalas si el producto es único. Agrega variantes si tiene sub-opciones.
                    </p>
                    <button type="button" className="btn-neon mt-4" onClick={addVariant}>
                      + Agregar variante
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {draft.variants.map((v, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-4 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                        data-testid={`variant-${vIdx}`}
                      >
                        <div className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto] mb-4 items-end">
                          <Field label="Nombre variante">
                            <input
                              className="input-vape"
                              value={v.name}
                              onChange={(e) => updateVariant(vIdx, { name: e.target.value })}
                              data-testid={`input-variant-name-${vIdx}`}
                            />
                          </Field>
                          <Field label="Precio detal">
                            <input
                              className="input-vape"
                              inputMode="numeric"
                              value={v.retailPrice ?? ""}
                              onChange={(e) =>
                                updateVariant(vIdx, { retailPrice: parseNumberInput(e.target.value) })
                              }
                              data-testid={`input-variant-retail-${vIdx}`}
                            />
                          </Field>
                          <Field label="Etiqueta">
                            <input
                              className="input-vape"
                              value={v.retailLabel ?? ""}
                              onChange={(e) => updateVariant(vIdx, { retailLabel: e.target.value })}
                              data-testid={`input-variant-label-${vIdx}`}
                            />
                          </Field>
                          <button
                            type="button"
                            className="btn-ghost danger"
                            onClick={() => removeVariant(vIdx)}
                            data-testid={`button-remove-variant-${vIdx}`}
                            style={{ padding: "0.7rem" }}
                          >
                            ✕
                          </button>
                        </div>

                        <div
                          className="pt-3 mt-1"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: "var(--color-ice)" }}>
                              Escalas · {v.tiers.length}
                            </div>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => addVariantTier(vIdx)}
                              data-testid={`button-add-variant-tier-${vIdx}`}
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.65rem" }}
                            >
                              + Escala
                            </button>
                          </div>
                          <TierRows
                            tiers={v.tiers}
                            onChange={(tIdx, patch) => updateVariantTier(vIdx, tIdx, patch)}
                            onRemove={(tIdx) => removeVariantTier(vIdx, tIdx)}
                            testIdPrefix={`v${vIdx}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: "var(--color-fog)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function TierRows({
  tiers,
  onChange,
  onRemove,
  testIdPrefix,
}: {
  tiers: PriceTier[];
  onChange: (idx: number, patch: Partial<PriceTier>) => void;
  onRemove: (idx: number) => void;
  testIdPrefix: string;
}) {
  if (tiers.length === 0) {
    return (
      <div className="font-mono text-xs uppercase tracking-widest text-center py-4" style={{ color: "var(--color-muted-2)" }}>
        Sin escalas.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {tiers.map((t, i) => (
        <div
          key={i}
          className="grid gap-2 items-center p-2 rounded-lg"
          style={{
            gridTemplateColumns: "1.4fr 0.7fr 1fr 1fr auto",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          data-testid={`tier-row-${testIdPrefix}-${i}`}
        >
          <input
            className="input-vape"
            placeholder="Etiqueta (ej. 50 unidades)"
            value={t.label}
            onChange={(e) => onChange(i, { label: e.target.value })}
            data-testid={`input-tier-label-${testIdPrefix}-${i}`}
            style={{ padding: "0.55rem 0.75rem" }}
          />
          <input
            className="input-vape"
            type="number"
            placeholder="Cant."
            value={t.quantity}
            onChange={(e) => onChange(i, { quantity: Number(e.target.value) || 0 })}
            data-testid={`input-tier-qty-${testIdPrefix}-${i}`}
            style={{ padding: "0.55rem 0.75rem" }}
          />
          <input
            className="input-vape"
            inputMode="numeric"
            placeholder="Precio unitario"
            value={t.unitPrice}
            onChange={(e) => onChange(i, { unitPrice: parseNumberInput(e.target.value) ?? 0 })}
            data-testid={`input-tier-price-${testIdPrefix}-${i}`}
            style={{ padding: "0.55rem 0.75rem" }}
          />
          <div
            className="px-3 py-2 rounded-lg font-mono text-sm text-right tabular-nums"
            style={{
              background: "rgba(200,255,0,0.06)",
              border: "1px solid rgba(200,255,0,0.2)",
              color: "var(--color-neon)",
              fontSize: "0.8rem",
            }}
            data-testid={`text-tier-total-${testIdPrefix}-${i}`}
          >
            {formatCop(t.quantity * t.unitPrice)}
          </div>
          <button
            type="button"
            className="btn-ghost danger"
            onClick={() => onRemove(i)}
            data-testid={`button-remove-tier-${testIdPrefix}-${i}`}
            style={{ padding: "0.55rem 0.75rem" }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function ImageGalleryPicker({
  products,
  currentId,
  currentPath,
  onPick,
}: {
  products: Product[];
  currentId: string;
  currentPath: string;
  onPick: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const gallery = products
    .filter((p) => p.id !== currentId && p.imagePath && p.imagePath.length > 0)
    .map((p) => ({
      id: p.id,
      path: p.imagePath as string,
      name: p.name,
      updatedAt: p.updatedAt ?? null,
    }))
    .filter((g, idx, arr) => arr.findIndex((x) => x.path === g.path) === idx);

  if (gallery.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => setOpen((v) => !v)}
        data-testid="button-toggle-gallery"
        style={{ fontSize: "0.65rem" }}
      >
        {open ? "▲ Ocultar galería" : `▼ Galería de imágenes (${gallery.length})`}
      </button>
      {open && (
        <div
          className="p-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="font-mono text-[0.58rem] uppercase tracking-widest mb-2 px-1"
            style={{ color: "var(--color-muted-2)" }}
          >
            Reutilizar imagen de otro producto
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {gallery.map((g) => {
              const isActive = g.path === currentPath;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onPick(g.path)}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                  style={{
                    border: isActive
                      ? "2px solid var(--color-neon)"
                      : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: isActive ? "0 0 12px rgba(200,255,0,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                  title={g.name}
                  data-testid={`gallery-pick-${g.id}`}
                >
                  <ProductImage
                    imagePath={g.path}
                    alt={g.name}
                    className="h-full"
                    cacheBust={g.updatedAt}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-1"
                    style={{ background: "linear-gradient(180deg, transparent 40%, rgba(6,6,12,0.9) 100%)" }}
                  >
                    <span className="font-mono text-[0.5rem] uppercase tracking-widest text-white truncate w-full text-center">
                      {g.name}
                    </span>
                  </div>
                  {isActive && (
                    <div
                      className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-neon)" }}
                    >
                      <span style={{ color: "var(--color-ink)", fontSize: "0.55rem", fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
  

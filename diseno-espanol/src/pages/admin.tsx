import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useAdminListProducts,
  useAdminCreateProduct,
  useAdminDeleteProduct,
  useAdminUpdateProduct,
  useListCategories,
  useGetSiteSettings,
  useAdminUpdateSiteSettings,
  getAdminListProductsQueryKey,
  getGetSiteSettingsQueryKey,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import ProductImage from "@/components/ProductImage";
import { useAdminSession, useLogout } from "@/lib/auth";
import { formatCop } from "@/lib/format";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { data: me, isLoading: meLoading } = useAdminSession();

  useEffect(() => {
    if (!meLoading && !me?.authenticated) {
      setLocation("/admin/login");
    }
  }, [me, meLoading, setLocation]);

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
          Cargando…
        </div>
      </div>
    );
  }

  if (!me?.authenticated) return null;

  return <Dashboard />;
}

function Dashboard() {
  const qc = useQueryClient();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useAdminListProducts();
  const { data: categories } = useListCategories();
  const createProduct = useAdminCreateProduct();
  const deleteProduct = useAdminDeleteProduct();
  const updateProduct = useAdminUpdateProduct();
  const [filter, setFilter] = useState<string>("");

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/admin/login");
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
  };

  const handleCreate = async () => {
    const res = await createProduct.mutateAsync({
      data: {
        name: "Nuevo producto",
        slug: `nuevo-${Date.now()}`,
        category: categories?.[0]?.slug ?? "capsulas",
        sortOrder: ((products?.length ?? 0) + 1) * 10,
        active: true,
        tiers: [],
      },
    });
    invalidate();
    setLocation(`/admin/products/${res.id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción es permanente.`)) return;
    await deleteProduct.mutateAsync({ id });
    invalidate();
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await updateProduct.mutateAsync({ id, data: { active: !active } });
    invalidate();
  };

  const filtered = (products ?? []).filter((p) =>
    !filter
      ? true
      : p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.slug.includes(filter.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <Header adminLink={false} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div
              className="font-mono text-xs uppercase tracking-[0.25em] mb-2"
              style={{ color: "var(--color-ice)" }}
            >
              Panel admin · CMS
            </div>
            <h1 className="font-display text-4xl text-gradient" style={{ letterSpacing: "0.06em" }}>
              CONTROL DE CATÁLOGO
            </h1>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost danger" onClick={handleLogout} data-testid="button-logout">
              Cerrar sesión
            </button>
          </div>
        </div>

        <SiteSettingsCard />

        <div className="card-vape p-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-2xl mb-1" style={{ color: "white" }}>
                PRODUCTOS · {products?.length ?? 0}
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                Edita imagen · texto · precios · escalas
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Buscar…"
                className="input-vape"
                style={{ width: 200 }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                data-testid="input-search"
              />
              <button
                type="button"
                className="btn-neon"
                onClick={handleCreate}
                disabled={createProduct.isPending}
                data-testid="button-new-product"
              >
                + Nuevo producto
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
              Cargando productos…
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="grid gap-4 p-3 rounded-xl items-center"
                  style={{
                    gridTemplateColumns: "80px 1fr auto auto",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: p.active ? 1 : 0.55,
                  }}
                  data-testid={`row-product-${p.slug}`}
                >
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ProductImage imagePath={p.imagePath} alt={p.name} className="h-full" cacheBust={p.updatedAt ?? null} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg leading-none" style={{ color: "white" }}>
                        {p.name}
                      </h3>
                      {p.badge && <span className="badge-vape">{p.badge}</span>}
                      {!p.active && (
                        <span className="badge-vape" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", borderColor: "rgba(239,68,68,0.3)" }}>
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[0.65rem] uppercase tracking-widest mb-1" style={{ color: "var(--color-muted-2)" }}>
                      {p.category} · {p.slug}
                    </div>
                    <div className="font-mono text-xs" style={{ color: "var(--color-fog)" }}>
                      {p.retailPrice != null && <span>Detal: {formatCop(p.retailPrice)} · </span>}
                      {(p.tiers?.length ?? 0) > 0 && <span>{p.tiers!.length} escalas</span>}
                      {(p.variants?.length ?? 0) > 0 && <span>{p.variants!.length} variantes</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleToggleActive(p.id, p.active ?? true)}
                    title={p.active ? "Ocultar" : "Mostrar"}
                    data-testid={`button-toggle-${p.slug}`}
                  >
                    {p.active ? "Ocultar" : "Mostrar"}
                  </button>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`} data-testid={`link-edit-${p.slug}`}>
                      <button type="button" className="btn-neon">
                        Editar
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost danger"
                      onClick={() => handleDelete(p.id, p.name)}
                      data-testid={`button-delete-${p.slug}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-10 text-center font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted-2)" }}>
                  Sin productos.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteSettingsCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useGetSiteSettings();
  const update = useAdminUpdateSiteSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setDraft({
        siteName: data.siteName ?? "",
        tagline: data.tagline ?? "",
        heroTitle: data.heroTitle ?? "",
        heroSubtitle: data.heroSubtitle ?? "",
        whatsapp: data.whatsapp ?? "",
        instagram: data.instagram ?? "",
        email: data.email ?? "",
        announcement: data.announcement ?? "",
      });
    }
  }, [data]);

  if (isLoading || !data) {
    return <div className="card-vape p-6">Cargando ajustes…</div>;
  }

  const handleSave = async () => {
    setSaved(false);
    await update.mutateAsync({
      data: Object.fromEntries(
        Object.entries(draft).map(([k, v]) => [k, v === "" ? null : v]),
      ),
    });
    qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: string; label: string; placeholder?: string; full?: boolean }[] = [
    { key: "siteName", label: "Nombre del sitio" },
    { key: "tagline", label: "Tagline" },
    { key: "heroTitle", label: "Título hero", full: true },
    { key: "heroSubtitle", label: "Subtítulo hero", full: true },
    { key: "announcement", label: "Anuncio superior", full: true },
    { key: "whatsapp", label: "WhatsApp", placeholder: "+57 300 000 0000" },
    { key: "instagram", label: "Instagram", placeholder: "@vapingstreet" },
    { key: "email", label: "Email" },
  ];

  return (
    <div className="card-vape p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="font-display text-2xl" style={{ color: "white" }}>
          AJUSTES DEL SITIO
        </h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span
              className="font-mono text-[0.65rem] uppercase tracking-widest"
              style={{ color: "var(--color-neon)" }}
              data-testid="text-settings-saved"
            >
              ✓ Guardado
            </span>
          )}
          <button
            type="button"
            className="btn-neon"
            onClick={handleSave}
            disabled={update.isPending}
            data-testid="button-save-settings"
          >
            {update.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={`flex flex-col gap-1.5 ${f.full ? "sm:col-span-2" : ""}`}>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: "var(--color-fog)" }}>
              {f.label}
            </span>
            {f.full ? (
              <textarea
                className="input-vape"
                rows={2}
                value={draft[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                data-testid={`input-settings-${f.key}`}
              />
            ) : (
              <input
                className="input-vape"
                value={draft[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                data-testid={`input-settings-${f.key}`}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

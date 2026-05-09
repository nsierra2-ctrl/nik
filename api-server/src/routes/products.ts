import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminReorderProductsBody,
  

} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/admin";

const router: IRouter = Router();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const baseSlug = base || `producto-${Date.now()}`;
  let candidate = baseSlug;
  let n = 2;
  while (true) {
    const [row] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, candidate))
      .limit(1);
    if (!row || row.id === ignoreId) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

function serializeProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category,
    badge: p.badge,
    imagePath: p.imagePath,
    retailPrice: p.retailPrice,
    retailLabel: p.retailLabel,
    unit: p.unit,
    thcPercent: p.thcPercent,
    notes: p.notes,
    sortOrder: p.sortOrder,
    active: p.active,
    variants: p.variants ?? [],
    tiers: p.tiers ?? [],
  };
}

// PUBLIC list
router.get("/products", async (req, res): Promise<void> => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const rows = category
    ? await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.category, category))
        .orderBy(asc(productsTable.sortOrder), asc(productsTable.name))
    : await db
        .select()
        .from(productsTable)
        .orderBy(asc(productsTable.sortOrder), asc(productsTable.name));

  const visible = rows.filter((r) => r.active);
  res.json(visible.map((r) => serializeProduct(r)));
});

// PUBLIC single
router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, raw))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.json(serializeProduct(row));
});

// ADMIN list (all including inactive)
router.get("/admin/products", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.name));
  res.json(rows.map((r) => serializeProduct(r)));
});

// ADMIN create
router.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const slug = await ensureUniqueSlug(data.slug ?? slugify(data.name));

  const [row] = await db
    .insert(productsTable)
    .values({
      slug,
      name: data.name,
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      category: data.category,
      badge: data.badge ?? null,
      imagePath: data.imagePath ?? null,
      retailPrice: data.retailPrice ?? null,
      retailLabel: data.retailLabel ?? null,
      unit: data.unit ?? null,
      thcPercent: data.thcPercent ?? null,
      notes: data.notes ?? null,
      sortOrder: data.sortOrder ?? 999,
      active: data.active ?? true,
      variants: (data.variants as never) ?? [],
      tiers: (data.tiers as never) ?? [],
    })
    .returning();

  res.status(201).json(serializeProduct(row));
});

// ADMIN update
router.patch("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const update: Record<string, unknown> = {};
  if (data.name !== undefined && data.name !== null) update.name = data.name;
  if (data.slug !== undefined && data.slug !== null) {
    update.slug = await ensureUniqueSlug(data.slug, id);
  }
  if (data.shortDescription !== undefined) update.shortDescription = data.shortDescription;
  if (data.description !== undefined) update.description = data.description;
  if (data.category !== undefined && data.category !== null) update.category = data.category;
  if (data.badge !== undefined) update.badge = data.badge;
  if (data.imagePath !== undefined) update.imagePath = data.imagePath;
  if (data.retailPrice !== undefined) update.retailPrice = data.retailPrice;
  if (data.retailLabel !== undefined) update.retailLabel = data.retailLabel;
  if (data.unit !== undefined) update.unit = data.unit;
  if (data.thcPercent !== undefined) update.thcPercent = data.thcPercent;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.sortOrder !== undefined && data.sortOrder !== null) update.sortOrder = data.sortOrder;
  if (data.active !== undefined && data.active !== null) update.active = data.active;
  if (data.variants !== undefined) update.variants = data.variants;
  if (data.tiers !== undefined) update.tiers = data.tiers;

  if (Object.keys(update).length === 0) {
    const [row] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(serializeProduct(row));
    return;
  }

  const [row] = await db
    .update(productsTable)
    .set(update)
    .where(eq(productsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.json(serializeProduct(row));
});

// ADMIN delete
router.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.status(204).end();
});

// ADMIN reorder bulk
router.post("/admin/products/reorder", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminReorderProductsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  for (const item of parsed.data.items) {
    await db
      .update(productsTable)
      .set({ sortOrder: item.sortOrder })
      .where(eq(productsTable.id, item.id));
  }
  res.status(204).end();
});

export default router;

import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  AdminCreateCategoryBody,
  AdminUpdateCategoryBody,


} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/admin";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
  res.json(rows.map((r) => r));
});

router.post("/admin/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(categoriesTable)
    .values({
      slug: parsed.data.slug,
      name: parsed.data.name,
      sortOrder: parsed.data.sortOrder ?? 999,
    })
    .onConflictDoUpdate({
      target: categoriesTable.slug,
      set: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder ?? 999,
      },
    })
    .returning();
  res.status(201).json(row);
});

router.patch("/admin/categories/:slug", requireAdmin, async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const parsed = AdminUpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const update: Record<string, unknown> = {};
  if (parsed.data.name != null) update.name = parsed.data.name;
  if (parsed.data.sortOrder != null) update.sortOrder = parsed.data.sortOrder;

  if (Object.keys(update).length === 0) {
    const [row] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Categoría no encontrada" });
      return;
    }
    res.json(row);
    return;
  }

  const [row] = await db
    .update(categoriesTable)
    .set(update)
    .where(eq(categoriesTable.slug, slug))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }
  res.json(row);
});

router.delete("/admin/categories/:slug", requireAdmin, async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [row] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }
  res.status(204).end();
});

export default router;

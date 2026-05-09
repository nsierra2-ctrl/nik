import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import {
  AdminUpdateSiteSettingsBody,

} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/admin";

const router: IRouter = Router();

const DEFAULT_SETTINGS = {
  id: 1,
  siteName: "VAPINGSTREET",
  tagline: "Mayorista en Colombia",
  heroTitle: "VAPING ES UN ESTILO DE VIDA",
  heroSubtitle:
    "Catálogo mayorista. Cápsulas, líquidos, baterías y más. Producto controlado solo para mayores de edad.",
  whatsapp: null,
  instagram: null,
  email: null,
  announcement: "Envíos a todo el país · Solo +18",
};

async function getOrCreate() {
  const [row] = await db.select().from(siteSettingsTable).limit(1);
  if (row) return row;
  const [inserted] = await db
    .insert(siteSettingsTable)
    .values(DEFAULT_SETTINGS)
    .onConflictDoNothing()
    .returning();
  if (inserted) return inserted;
  const [again] = await db.select().from(siteSettingsTable).limit(1);
  return again ?? DEFAULT_SETTINGS;
}

router.get("/admin/site-settings", async (_req, res): Promise<void> => {
  const row = await getOrCreate();
  res.json(row);
});

router.patch("/admin/site-settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminUpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await getOrCreate();
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) update[k] = v;
  }
  const [row] = await db
    .update(siteSettingsTable)
    .set(update)
    .where(eq(siteSettingsTable.id, 1))
    .returning();
  res.json(row);
});

export default router;

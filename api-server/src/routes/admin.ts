import { Router, type IRouter } from "express";
import { randomBytes, timingSafeEqual } from "crypto";
import { eq, lt } from "drizzle-orm";
import { db, adminSessionsTable } from "@workspace/db";
import { AdminLoginBody as AdminLoginInput } from "@workspace/api-zod";
import { ADMIN_COOKIE, isAdminAuthenticated } from "../middlewares/admin";

const router: IRouter = Router();

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    req.log.error("ADMIN_PASSWORD env var is not set");
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }

  if (!constantTimeEqual(parsed.data.password, expected)) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(adminSessionsTable).values({ token, expiresAt });

  // Best-effort cleanup of expired sessions
  await db
    .delete(adminSessionsTable)
    .where(lt(adminSessionsTable.expiresAt, new Date()));

  const isProd = process.env.NODE_ENV === "production";
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });

  res.json({ authenticated: true });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (token && typeof token === "string") {
    await db.delete(adminSessionsTable).where(eq(adminSessionsTable.token, token));
  }
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.status(204).end();
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const ok = await isAdminAuthenticated(req);
  res.json({ authenticated: ok });
});

export default router;

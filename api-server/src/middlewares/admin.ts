import type { Request, Response, NextFunction } from "express";
import { eq, gt, and } from "drizzle-orm";
import { db, adminSessionsTable } from "@workspace/db";

export const ADMIN_COOKIE = "vps_admin";

export async function isAdminAuthenticated(req: Request): Promise<boolean> {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token || typeof token !== "string") return false;

  const [session] = await db
    .select()
    .from(adminSessionsTable)
    .where(
      and(
        eq(adminSessionsTable.token, token),
        gt(adminSessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return !!session;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const ok = await isAdminAuthenticated(req);
  if (!ok) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

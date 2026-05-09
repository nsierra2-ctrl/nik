import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("VAPINGSTREET"),
  tagline: text("tagline"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  email: text("email"),
  announcement: text("announcement"),
});

export type SiteSettings = typeof siteSettingsTable.$inferSelect;

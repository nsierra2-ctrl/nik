import {
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type PriceTier = {
  label: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type ProductVariant = {
  name: string;
  retailPrice?: number | null;
  retailLabel?: string | null;
  tiers: PriceTier[];
};

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  category: text("category").notNull(),
  badge: text("badge"),
  imagePath: text("image_path"),
  retailPrice: integer("retail_price"),
  retailLabel: text("retail_label"),
  unit: text("unit"),
  thcPercent: text("thc_percent"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  variants: jsonb("variants").$type<ProductVariant[]>().notNull().default([]),
  tiers: jsonb("tiers").$type<PriceTier[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

# Workspace

## Overview

pnpm workspace monorepo. Hosts the **VAPING STREET** wholesale vape catalog for Colombia: a public catalog with age verification (+18) → animated preloader → catalog with expandable product cards, real-time cart, WhatsApp checkout, and a password-protected admin CMS for editing products, prices, images, and site settings.

## Artifacts

- **artifacts/api-server** (`@workspace/api-server`) — Express 5 API at `/api/*`. Cookie-session admin auth, product CRUD, image upload presigned URLs, site settings.
- **artifacts/diseno-espanol** (`@workspace/diseno-espanol`) — React + Vite catalog frontend at `/`. Dark cyberpunk design (Bebas Neue / Syne / JetBrains Mono).
- **artifacts/mockup-sandbox** — design canvas (unused by VAPINGSTREET).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Express 5, PostgreSQL + Drizzle ORM, Replit Object Storage
- Zod (`zod/v4`), `drizzle-zod`, Orval (OpenAPI → React Query hooks + Zod)
- React 19, Vite 7, Tailwind 4, Wouter, TanStack Query

## VAPING STREET features

- **Catalog**: exactly **30 products** in 6 categories — Cápsulas (11), Líquidos (4), Jeringas (1), Baterías (3), Desechables (2), Gomas (9). Each card shows retail + lowest wholesale price.
- **Flow**: Age gate (+18) → animated preloader (logo reveal + smoke) → catalog. Admin routes bypass age gate; dev override: `?adult=1`.
- **Expandable product cards**: clicking a card opens a fullscreen modal with zoomable image, every retail/wholesale tier as a selectable choice, ± qty stepper, live subtotal, "Añadir" or "Añadir + ver carrito" buttons.
- **Real-time cart**: persisted to `localStorage` (`vps_cart_v1`), floating cart FAB with item count, drawer with ± steppers, totals in COP, "Pedir por WhatsApp" button that builds a wa.me URL with the formatted order and opens it after a celebration flash.
- **Admin-configurable WhatsApp**: number is read from the site settings (`whatsapp` field) and used by the checkout button.
- **Sounds & haptics**: Web Audio click/pop/success beeps with mute toggle (`vps_mute`), all reactive to add-to-cart and checkout.
- **Animated UI**: animated radial-orb background, scanline product images, hover lift, modal pop-in, smoke preloader, gradient brand wordmark.
- **Admin CMS** at `/admin/login` (password env `ADMIN_PASSWORD`, cookie session 30d):
  - Edit name, badge, descriptions, category, retail price/label, unit, THC %, notes
  - Per-product variants and tiered wholesale pricing (auto-computed totals)
  - Toggle active/inactive, delete, create new products
  - **Image upload via Uppy** → presigned PUT to GCS → served via `/api/storage/objects/*`. Persisted immediately and the catalog/admin/edit views refresh in real-time via cache invalidation + `?v=updatedAt` cache-busting.
  - **Image gallery picker**: pick any existing product image with one click; saves and updates everywhere instantly.
  - Site settings: name, tagline, hero copy, contact (whatsapp/instagram/email), announcement bar.
- **Storage**: Replit Object Storage. Public assets via `PUBLIC_OBJECT_SEARCH_PATHS`, private via `PRIVATE_OBJECT_DIR`. Upload URL endpoint requires admin.

## Environment

- `DATABASE_URL` — Postgres
- `SESSION_SECRET` — admin sessions
- `ADMIN_PASSWORD` — admin panel password (set in `.replit` userenv to `vapingstreet2026`)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` — object storage

## Key commands

- `pnpm run typecheck` — typecheck all packages
- `pnpm run build` — typecheck + build all
- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks/Zod from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema (dev)

## Notes

- API mounted at `/api`; web at `/`. Same-origin via Replit proxy → cookies work without CORS config.
- `/api/admin/site-settings` GET is public (used by home), PATCH requires admin.
- Server seeds the catalog on first boot (`artifacts/api-server/src/lib/seed.ts`).

import { sql } from "drizzle-orm";
import { db, productsTable, categoriesTable, siteSettingsTable } from "@workspace/db";
import type { ProductVariant, PriceTier, InsertProduct } from "@workspace/db";
import { logger } from "./logger";

const TARGET_PRODUCT_COUNT = 30;

const CATEGORIES: { slug: string; name: string; sortOrder: number }[] = [
  { slug: "capsulas", name: "Cápsulas", sortOrder: 1 },
  { slug: "liquidos", name: "Líquidos importados", sortOrder: 2 },
  { slug: "jeringas", name: "Jeringas", sortOrder: 3 },
  { slug: "baterias", name: "Baterías", sortOrder: 4 },
  { slug: "desechables", name: "Desechables", sortOrder: 5 },
  { slug: "gomas", name: "Gomas", sortOrder: 6 },
];

function tier(quantity: number, unitPrice: number): PriceTier {
  return {
    label: `${quantity} unidades`,
    quantity,
    unitPrice,
    totalPrice: quantity * unitPrice,
  };
}

function pkgTier(packs: number, unitPrice: number, packLabel: string): PriceTier {
  return {
    label: `${packs} ${packLabel}`,
    quantity: packs,
    unitPrice,
    totalPrice: packs * unitPrice,
  };
}

const PRODUCTS: InsertProduct[] = [
  // ──────────────── CÁPSULAS (11) ────────────────
  {
    slug: "capsulas-delta-9-clear",
    name: "Cápsulas Delta 9 Clear",
    shortDescription: "Cápsula transparente premium",
    description:
      "Delta 9 clear totalmente transparente. Calidad premium con efecto controlado y duradero.",
    category: "capsulas",
    badge: "PREMIUM",
    retailPrice: 60000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 10,
    active: true,
    tiers: [
      tier(10, 30000),
      tier(50, 22000),
      tier(100, 18000),
      tier(1000, 14000),
      tier(2500, 10000),
      tier(5000, 9500),
    ],
  },
  {
    slug: "capsulas-nacionales",
    name: "Cápsulas Nacionales",
    shortDescription: "Tapa negra o blanca · garantizadas",
    description:
      "Cápsulas nacionales totalmente garantizadas en presentación de tapa negra o blanca.",
    category: "capsulas",
    badge: "BEST SELLER",
    retailPrice: 30000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 20,
    active: true,
    tiers: [
      tier(10, 20000),
      tier(50, 18000),
      tier(100, 16000),
      tier(1000, 12000),
      tier(2500, 10000),
      tier(5000, 9000),
    ],
  },
  {
    slug: "capsulas-htfse-full-spectrum",
    name: "Cápsulas HTFSE Full Spectrum",
    shortDescription: "Con diamantes de live resin",
    description:
      "Cápsulas de HTFSE (full spectrum) con diamantes de live resin. La experiencia más completa.",
    category: "capsulas",
    badge: "TOP TIER",
    retailPrice: 80000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 30,
    active: true,
    tiers: [
      tier(10, 40000),
      tier(50, 30000),
      tier(100, 28000),
      tier(500, 25000),
      tier(1000, 20000),
    ],
  },
  {
    slug: "capsulas-importadas",
    name: "Cápsulas Importadas",
    shortDescription: "Calidad import garantizada",
    description: "Cápsulas importadas premium. Stock disponible para distribución mayorista.",
    category: "capsulas",
    badge: "IMPORT",
    retailPrice: 55000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 40,
    active: true,
    tiers: [
      tier(10, 30000),
      tier(50, 27000),
      tier(100, 25000),
      tier(500, 23000),
      tier(1000, 20000),
    ],
  },
  {
    slug: "capsulas-zeenova",
    name: "Cápsulas ZEENOVA",
    shortDescription: "THC efectivo · presentación tarro x10",
    description:
      "ZEENOVA: cápsulas de THC totalmente efectivas para llevarte a otra dimensión. Recomendación: no fumar al consumirlas, puedes ingerir más productos pero menos fumar.",
    category: "capsulas",
    badge: "ZEENOVA",
    retailPrice: 55000,
    retailLabel: "Tarro x 10 unidades",
    unit: "tarro",
    notes: "Tarro x 10 unidades. Mayoreo desde 10 tarros en adelante.",
    sortOrder: 50,
    active: true,
    tiers: [
      { label: "10+ tarros", quantity: 10, unitPrice: 45000, totalPrice: 450000 },
    ],
  },
  {
    slug: "salsa-terpenos",
    name: "Salsa de Terpenos",
    shortDescription: "Cápsulas con salsa de terpenos",
    description: "Salsa de terpenos en cápsula. Perfil aromático y efecto premium.",
    category: "capsulas",
    badge: "TERPENOS",
    retailPrice: 80000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 60,
    active: true,
    tiers: [
      tier(10, 60000),
      tier(50, 45000),
      tier(100, 40000),
      tier(500, 37000),
      tier(1000, 35000),
    ],
  },
  {
    slug: "capsulas-2ml",
    name: "Cápsulas 2ml",
    shortDescription: "4 variedades disponibles",
    description:
      "Cápsulas de 2ml en 4 variedades: Nacional, Delta 9, Delta 9 Clear y Full Spectrum.",
    category: "capsulas",
    badge: "4 VARIANTES",
    retailLabel: "Ver variantes",
    unit: "unidad",
    sortOrder: 70,
    active: true,
    variants: [
      {
        name: "Nacional",
        retailPrice: 60000,
        retailLabel: "1 unidad",
        tiers: [
          { label: "5 unidades", quantity: 5, unitPrice: 38000, totalPrice: 190000 },
          { label: "10 unidades", quantity: 10, unitPrice: 35000, totalPrice: 350000 },
        ],
      },
      {
        name: "Delta 9",
        retailPrice: 65000,
        retailLabel: "1 unidad",
        tiers: [
          { label: "5 unidades", quantity: 5, unitPrice: 40000, totalPrice: 200000 },
          { label: "10 unidades", quantity: 10, unitPrice: 38000, totalPrice: 380000 },
        ],
      },
      {
        name: "Delta 9 Clear",
        retailPrice: 65000,
        retailLabel: "1 unidad",
        tiers: [
          { label: "5 unidades", quantity: 5, unitPrice: 40000, totalPrice: 200000 },
          { label: "10 unidades", quantity: 10, unitPrice: 38000, totalPrice: 380000 },
        ],
      },
      {
        name: "Full Spectrum",
        retailPrice: 110000,
        retailLabel: "1 unidad",
        tiers: [
          { label: "5 unidades", quantity: 5, unitPrice: 70000, totalPrice: 350000 },
          { label: "10 unidades", quantity: 10, unitPrice: 50000, totalPrice: 500000 },
        ],
      },
    ] as ProductVariant[],
    tiers: [],
  },
  {
    slug: "capsulas-live-resin",
    name: "Cápsulas Live Resin",
    shortDescription: "Extracción fresca · perfil pleno",
    description:
      "Cápsulas Live Resin con extracción en frío para preservar terpenos y obtener un perfil aromático completo.",
    category: "capsulas",
    badge: "LIVE RESIN",
    retailPrice: 75000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 80,
    active: true,
    tiers: [tier(10, 55000), tier(50, 45000), tier(100, 40000), tier(500, 35000)],
  },
  {
    slug: "capsulas-cbd-hybrid",
    name: "Cápsulas CBD Hybrid",
    shortDescription: "Mezcla CBD + THC equilibrada",
    description:
      "Mezcla balanceada CBD/THC. Ideal para uso diurno con efecto suave y funcional.",
    category: "capsulas",
    badge: "CBD",
    retailPrice: 50000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 90,
    active: true,
    tiers: [tier(10, 35000), tier(50, 28000), tier(100, 24000), tier(500, 22000)],
  },
  {
    slug: "capsulas-sativa-boost",
    name: "Cápsulas Sativa Boost",
    shortDescription: "Energía · enfoque · creatividad",
    description:
      "Perfil sativa con terpenos energéticos. Para sesiones diurnas y creativas.",
    category: "capsulas",
    badge: "SATIVA",
    retailPrice: 65000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 100,
    active: true,
    tiers: [tier(10, 45000), tier(50, 38000), tier(100, 32000), tier(500, 28000)],
  },
  {
    slug: "capsulas-indica-relax",
    name: "Cápsulas Indica Relax",
    shortDescription: "Relajación profunda · descanso",
    description:
      "Perfil indica con efecto relajante. Recomendado para uso nocturno y descanso.",
    category: "capsulas",
    badge: "INDICA",
    retailPrice: 65000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 110,
    active: true,
    tiers: [tier(10, 45000), tier(50, 38000), tier(100, 32000), tier(500, 28000)],
  },

  // ──────────────── LÍQUIDOS (4) ────────────────
  {
    slug: "liquido-delta-9-clear",
    name: "Líquido Delta 9 Clear (litro)",
    shortDescription: "Litro Delta 9 clear · 96.487% THC",
    description:
      "Litro de Delta 9 clear totalmente garantizado al 96.487% de THC. Precio por ml totalmente terpeniado; sin terpeniar entramos a negociar.",
    category: "liquidos",
    badge: "96.487% THC",
    retailLabel: "Por ml",
    thcPercent: "96.487%",
    unit: "ml",
    notes: "1 litro entra a negociar o podemos negociar la cantidad si se vuelven clientes fijos.",
    sortOrder: 200,
    active: true,
    tiers: [tier(10, 15000), tier(50, 10000), tier(100, 9000), tier(500, 7000)],
  },
  {
    slug: "liquido-full-spectrum",
    name: "Líquido Full Spectrum (litro)",
    shortDescription: "107.657% THC · diamantes live resin",
    description:
      "Litro de full spectrum 107.657% de THC totalmente garantizado, con diamantes de live resin totalmente visibles.",
    category: "liquidos",
    badge: "FULL SPECTRUM",
    retailLabel: "Por ml",
    thcPercent: "107.657%",
    unit: "ml",
    notes: "1 litro entra a negociar o podemos negociar la cantidad si se vuelven clientes fijos.",
    sortOrder: 210,
    active: true,
    tiers: [tier(10, 25000), tier(50, 20000), tier(100, 18000), tier(500, 14000)],
  },
  {
    slug: "liquido-delta-9",
    name: "Líquido Delta 9 (litro)",
    shortDescription: "96.507% THC garantizado",
    description:
      "Litro de Delta 9 totalmente garantizado al 96.507% de THC. Se vende por ml o por litro; si es crudo entramos a negociar; si es terpeniado damos precios estimados.",
    category: "liquidos",
    badge: "96.507% THC",
    retailLabel: "Por ml",
    thcPercent: "96.507%",
    unit: "ml",
    notes: "1 litro entra a negociar o podemos negociar la cantidad si se vuelven clientes fijos.",
    sortOrder: 220,
    active: true,
    tiers: [tier(10, 15000), tier(50, 11000), tier(100, 9500), tier(500, 7000)],
  },
  {
    slug: "liquido-delta-9-clase-2",
    name: "Líquido Delta 9 Clase 2 (litro)",
    shortDescription: "94.558% THC · líquido importado",
    description:
      "Litro Delta 9 clase 2 totalmente garantizado 94.558% de THC. Se vende por ml o por litro; si es crudo entramos a negociar; si es terpeniado damos precios estimados.",
    category: "liquidos",
    badge: "94.558% THC",
    retailLabel: "Por ml",
    thcPercent: "94.558%",
    unit: "ml",
    notes: "1 litro se entra a negociar o podemos negociar la cantidad que desees.",
    sortOrder: 230,
    active: true,
    tiers: [tier(10, 13000), tier(50, 10000), tier(100, 8500), tier(500, 6700)],
  },

  // ──────────────── JERINGAS (1) ────────────────
  {
    slug: "jeringas-litro-nacional",
    name: "Jeringas · Litro nacional",
    shortDescription: "Litro nacional · 94.367% THC",
    description:
      "Litro nacional totalmente garantizado al 94.367% de THC, presentación en jeringas.",
    category: "jeringas",
    badge: "94.367% THC",
    retailLabel: "Por ml",
    thcPercent: "94.367%",
    unit: "ml",
    notes: "1 litro entra a negociar o podemos negociar la cantidad si se vuelven clientes fijos.",
    sortOrder: 300,
    active: true,
    tiers: [tier(10, 13000), tier(50, 11000), tier(100, 9500), tier(500, 6000)],
  },

  // ──────────────── BATERÍAS (3) ────────────────
  {
    slug: "baterias-brass-tipo-c",
    name: "Baterías Brass Tipo C",
    shortDescription: "Con garantía",
    description: "Baterías brass tipo C con garantía. Compatibles con cápsulas estándar 510.",
    category: "baterias",
    badge: "GARANTÍA",
    retailPrice: 25000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 400,
    active: true,
    tiers: [tier(10, 18000), tier(50, 15000), tier(100, 13000), tier(500, 12000)],
  },
  {
    slug: "bateria-brass-pantalla-digital",
    name: "Batería Brass Pantalla Digital",
    shortDescription: "Voltaje variable con display",
    description:
      "Batería brass con pantalla digital. Control de voltaje preciso para cada cápsula.",
    category: "baterias",
    badge: "DIGITAL",
    retailPrice: 25000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 410,
    active: true,
    tiers: [tier(10, 20000), tier(50, 16000), tier(100, 15500)],
  },
  {
    slug: "bateria-usb-c-slim",
    name: "Batería USB-C Slim",
    shortDescription: "Carga rápida USB-C",
    description: "Batería slim 510 con puerto USB-C de carga rápida y voltaje seleccionable.",
    category: "baterias",
    badge: "USB-C",
    retailPrice: 30000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 420,
    active: true,
    tiers: [tier(10, 22000), tier(50, 18000), tier(100, 16000)],
  },

  // ──────────────── DESECHABLES (2) ────────────────
  {
    slug: "desechable-3-5ml",
    name: "Desechable 3.5ml",
    shortDescription: "Con cargador incluido",
    description: "Dispositivo desechable de 3.5ml con cargador incluido. Listo para usar.",
    category: "desechables",
    badge: "CON CARGADOR",
    retailPrice: 85000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 500,
    active: true,
    tiers: [tier(10, 75000), tier(50, 60000), tier(100, 55000)],
  },
  {
    slug: "desechable-5ml-premium",
    name: "Desechable 5ml Premium",
    shortDescription: "Larga duración · cargador incluido",
    description:
      "Desechable de 5ml de gran capacidad con cargador USB-C incluido. Perfil terpénico premium.",
    category: "desechables",
    badge: "5ML",
    retailPrice: 110000,
    retailLabel: "1 unidad",
    unit: "unidad",
    sortOrder: 510,
    active: true,
    tiers: [tier(10, 90000), tier(50, 80000), tier(100, 72000)],
  },

  // ──────────────── GOMAS (9) ────────────────
  {
    slug: "gomas-nacionales-paquete-10",
    name: "Gomas Nacionales (paquete x10)",
    shortDescription: "Gomas THC nacionales",
    description: "Gomas de THC nacionales. Paquete x 10 unidades.",
    category: "gomas",
    badge: "NACIONALES",
    retailPrice: 60000,
    retailLabel: "1 paquete",
    unit: "paquete",
    sortOrder: 600,
    active: true,
    tiers: [
      pkgTier(5, 45000, "paquetes"),
      pkgTier(10, 42000, "paquetes"),
      pkgTier(50, 38000, "paquetes"),
    ],
  },
  {
    slug: "gomas-importadas-tarro-20-150",
    name: "Gomas Importadas · Tarro x20 (150k)",
    shortDescription: "Tarro 20 gomas — referencia 150",
    description: "Gomas importadas 100% garantizadas. Tarro de 20 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 150000,
    retailLabel: "Tarro x 20 gomas",
    unit: "tarro",
    sortOrder: 610,
    active: true,
    tiers: [pkgTier(5, 130000, "tarros"), pkgTier(10, 120000, "tarros")],
  },
  {
    slug: "gomas-importadas-20-180",
    name: "Gomas Importadas · 20 (180k)",
    shortDescription: "Pack 20 gomas — referencia 180",
    description: "Gomas importadas 100% garantizadas. Pack de 20 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 180000,
    retailLabel: "20 gomas",
    unit: "pack",
    sortOrder: 620,
    active: true,
    tiers: [pkgTier(5, 160000, "packs"), pkgTier(10, 150000, "packs")],
  },
  {
    slug: "gomas-importadas-10-120-a",
    name: "Gomas Importadas · 10 (120k) — A",
    shortDescription: "Pack 10 gomas — referencia 120",
    description: "Gomas importadas 100% garantizadas. Pack de 10 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 120000,
    retailLabel: "10 gomas",
    unit: "pack",
    sortOrder: 630,
    active: true,
    tiers: [pkgTier(5, 105000, "packs"), pkgTier(10, 95000, "packs")],
  },
  {
    slug: "gomas-importadas-10-120-b",
    name: "Gomas Importadas · 10 (120k) — B",
    shortDescription: "Pack 10 gomas — referencia 120",
    description: "Gomas importadas 100% garantizadas. Pack de 10 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 120000,
    retailLabel: "10 gomas",
    unit: "pack",
    sortOrder: 640,
    active: true,
    tiers: [pkgTier(5, 105000, "packs"), pkgTier(10, 95000, "packs")],
  },
  {
    slug: "gomas-importadas-20-180-b",
    name: "Gomas Importadas · 20 (180k) — B",
    shortDescription: "Pack 20 gomas — referencia 180",
    description: "Gomas importadas. Pack de 20 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 180000,
    retailLabel: "20 gomas",
    unit: "pack",
    sortOrder: 650,
    active: true,
    tiers: [pkgTier(5, 160000, "packs"), pkgTier(10, 150000, "packs")],
  },
  {
    slug: "gomas-importadas-10-130",
    name: "Gomas Importadas · 10 (130k)",
    shortDescription: "Pack 10 gomas — referencia 130",
    description: "Gomas importadas. Pack de 10 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 130000,
    retailLabel: "10 gomas",
    unit: "pack",
    sortOrder: 660,
    active: true,
    tiers: [pkgTier(5, 115000, "packs"), pkgTier(10, 105000, "packs")],
  },
  {
    slug: "gomas-importadas-20-150",
    name: "Gomas Importadas · 20 (150k)",
    shortDescription: "Pack 20 gomas — referencia 150",
    description: "Gomas importadas. Pack de 20 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 150000,
    retailLabel: "20 gomas",
    unit: "pack",
    sortOrder: 670,
    active: true,
    tiers: [pkgTier(5, 130000, "packs"), pkgTier(10, 120000, "packs")],
  },
  {
    slug: "gomas-importadas-10-80",
    name: "Gomas Importadas · 10 (80k)",
    shortDescription: "Pack 10 gomas — referencia 80",
    description: "Gomas importadas. Pack de 10 gomas.",
    category: "gomas",
    badge: "IMPORT",
    retailPrice: 80000,
    retailLabel: "10 gomas",
    unit: "pack",
    sortOrder: 680,
    active: true,
    tiers: [pkgTier(5, 70000, "packs"), pkgTier(10, 65000, "packs")],
  },
];

const SITE_DEFAULTS = {
  id: 1,
  siteName: "VAPING STREET",
  tagline: "Catálogo mayorista en Colombia",
  heroTitle: "VAPING ES UN ESTILO DE VIDA",
  heroSubtitle:
    "Distribución mayorista de productos de vapeo. Cápsulas, líquidos, baterías, gomas y desechables — precios por volumen, envío nacional, atención directa.",
  whatsapp: null,
  instagram: null,
  email: null,
  announcement: "Envíos a todo el país · Solo +18 · Atención mayorista",
};

export async function ensureSeed(): Promise<void> {
  // Categories: upsert
  for (const c of CATEGORIES) {
    await db
      .insert(categoriesTable)
      .values(c)
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { name: c.name, sortOrder: c.sortOrder },
      });
  }

  // Site settings: insert if missing
  await db.insert(siteSettingsTable).values(SITE_DEFAULTS).onConflictDoNothing();

  // Products: only seed when empty
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  if (Number(count) === 0) {
    await db.insert(productsTable).values(PRODUCTS);
    logger.info(
      { inserted: PRODUCTS.length, target: TARGET_PRODUCT_COUNT },
      "Seed products inserted",
    );
  } else {
    logger.info({ existing: count }, "Products already present, skipping seed");
  }
}

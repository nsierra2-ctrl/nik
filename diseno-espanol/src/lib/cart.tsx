import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sounds } from "./sounds";

const STORAGE_KEY = "vps_cart_v1";

export type CartMode = "retail" | "tier";

export type CartItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  imagePath: string | null;
  variantName?: string;
  mode: CartMode;
  label: string;
  unitsPerLot: number;
  unitPrice: number;
  quantity: number;
};

type CartCtxValue = {
  items: CartItem[];
  itemCount: number;
  totalUnits: number;
  totalPrice: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (input: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  inc: (id: string, delta?: number) => void;
  clear: () => void;
};

const CartCtx = createContext<CartCtxValue | null>(null);

function makeKey(input: {
  productId: string;
  mode: CartMode;
  label: string;
  variantName?: string;
}): string {
  return [input.productId, input.mode, input.variantName ?? "", input.label].join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback<CartCtxValue["add"]>(
    (input) => {
      const qty = Math.max(1, input.quantity ?? 1);
      const key = makeKey(input);
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          return next;
        }
        return [
          ...prev,
          {
            id: key,
            productId: input.productId,
            productSlug: input.productSlug,
            productName: input.productName,
            imagePath: input.imagePath,
            variantName: input.variantName,
            mode: input.mode,
            label: input.label,
            unitsPerLot: input.unitsPerLot,
            unitPrice: input.unitPrice,
            quantity: qty,
          },
        ];
      });
      sounds.add();
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    sounds.remove();
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      sounds.remove();
      return;
    }
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p)),
    );
  }, []);

  const inc = useCallback((id: string, delta = 1) => {
    setItems((prev) => {
      const next: CartItem[] = [];
      for (const p of prev) {
        if (p.id !== id) {
          next.push(p);
          continue;
        }
        const q = p.quantity + delta;
        if (q <= 0) continue;
        next.push({ ...p, quantity: q });
      }
      return next;
    });
    sounds.click();
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.length;
  const totalUnits = useMemo(
    () => items.reduce((s, it) => s + it.quantity * it.unitsPerLot, 0),
    [items],
  );
  const totalPrice = useMemo(
    () => items.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
    [items],
  );

  const value: CartCtxValue = {
    items,
    itemCount,
    totalUnits,
    totalPrice,
    open,
    setOpen,
    add,
    remove,
    setQty,
    inc,
    clear,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(): CartCtxValue {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

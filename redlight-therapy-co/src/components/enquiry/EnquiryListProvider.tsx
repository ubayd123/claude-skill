"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ListItem = { productId: number; slug: string; name: string; image: string; quantity: number };

type Ctx = {
  items: ListItem[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<ListItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const EnquiryCtx = createContext<Ctx | null>(null);
const KEY = "rltc-enquiry-list-v1";
const MAX_QTY = 100000;

function read(): ListItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is ListItem =>
        typeof x === "object" && x !== null && typeof (x as ListItem).productId === "number" && typeof (x as ListItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function EnquiryListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(read());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: list lives for this visit only */
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<ListItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const q = Math.max(1, Math.min(MAX_QTY, Math.round(quantity)));
      const found = prev.find((p) => p.productId === item.productId);
      if (found) return prev.map((p) => (p.productId === item.productId ? { ...p, quantity: Math.min(MAX_QTY, p.quantity + q) } : p));
      return [...prev, { ...item, quantity: q }];
    });
    setOpen(true);
  }, []);
  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity: Math.max(1, Math.min(MAX_QTY, Math.round(quantity) || 1)) } : p)),
    );
  }, []);
  const remove = useCallback((productId: number) => setItems((prev) => prev.filter((p) => p.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.reduce((n, i) => n + i.quantity, 0), open, setOpen, add, setQuantity, remove, clear }),
    [items, open, add, setQuantity, remove, clear],
  );
  return <EnquiryCtx.Provider value={value}>{children}</EnquiryCtx.Provider>;
}

export function useEnquiryList() {
  const ctx = useContext(EnquiryCtx);
  if (!ctx) throw new Error("useEnquiryList must be used inside EnquiryListProvider");
  return ctx;
}

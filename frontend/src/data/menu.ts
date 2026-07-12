'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Euro Hotel — Dining Menu (single source of truth)
//
// Items live in the `hotel.menu_items` table and are managed from the admin
// panel (/dashboard/menu). This module fetches them from the public backend
// endpoint `GET /api/menu`, which returns only available items.
//
// The DB column names (image_url / is_available / is_featured) are mapped to
// the shape the UI components already use (image / available / featured).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

/**
 * Fixed set — mirrored by the menu_items_category_check constraint (migration 007)
 * and the MenuCategory Literal in backend/app/schemas/menu.py. Also the render order
 * for category sections on /dining/menu. Change all three together.
 */
export const MENU_CATEGORIES = ['Breakfast', 'Main Course', 'Drinks', 'Desserts'] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  /** Price in INR (rendered with the ₹ symbol). */
  price: number;
  category: MenuCategory;
  /** Remote image URL — ImageKit (admin uploads) or Unsplash (seed data). */
  image: string;
  available: boolean;
  /** Featured items surface in the "Signature Flavors" carousel. */
  featured: boolean;
}

interface ApiMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
}

const toMenuItem = (row: ApiMenuItem): MenuItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  category: row.category,
  image: row.image_url,
  available: row.is_available,
  featured: row.is_featured,
});

export const fetchMenu = async (): Promise<MenuItem[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/api/menu`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load menu (${res.status})`);
  const rows: ApiMenuItem[] = await res.json();
  return rows.map(toMenuItem);
};

/** Fetches the live menu once on mount. */
export const useMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchMenu()
      .then((data) => active && setItems(data))
      .catch((err) => console.error('Menu load failed:', err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
};

/** Categories that actually have items, in MENU_CATEGORIES order. */
export const getCategories = (items: MenuItem[]): MenuCategory[] =>
  MENU_CATEGORIES.filter((c) => items.some((i) => i.category === c));

/** All available items for a given category. */
export const getMenuByCategory = (items: MenuItem[], category: MenuCategory): MenuItem[] =>
  items.filter((item) => item.category === category && item.available);

/** Featured items surfaced in the Signature Flavors carousel. */
export const getFeaturedItems = (items: MenuItem[]): MenuItem[] =>
  items.filter((item) => item.featured && item.available);

-- Manual menu ordering (drag-to-reorder in the admin panel).
-- Ordering is global; the website groups by category, so within-category order
-- falls out of the global order for free.

ALTER TABLE hotel.menu_items
    ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill: preserve the current (insertion-order) listing.
UPDATE hotel.menu_items SET sort_order = id WHERE sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON hotel.menu_items (sort_order);

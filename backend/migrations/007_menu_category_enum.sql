-- Categories are a fixed set, not free text. Enforced in the DB so a bad value
-- can't get in via the API or a stray SQL statement.
--
-- To add a category later: drop and recreate this constraint with the new value,
-- and add it to MENU_CATEGORIES in backend/app/schemas/menu.py and
-- frontend/src/data/menu.ts.

ALTER TABLE hotel.menu_items
    DROP CONSTRAINT IF EXISTS menu_items_category_check;

ALTER TABLE hotel.menu_items
    ADD CONSTRAINT menu_items_category_check
    CHECK (category IN ('Breakfast', 'Main Course', 'Drinks', 'Desserts'));
